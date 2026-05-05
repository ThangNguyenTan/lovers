import { doc, setDoc, runTransaction, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Generates a random 6-character alphanumeric pairing code.
 */
function generatePairingCode() {
  // Uses base 36 to get numbers and letters, slices a 6 char string, and uppercases it.
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * User A calls this to create a pairing code.
 * @param {string} userId - User A's Firebase Auth ID
 * @param {Object} userInfo - User A's metadata (e.g. name, avatar)
 * @returns {Promise<string>} The generated 6-character code
 */
export const createPairingCode = async (userId, userInfo) => {
  const code = generatePairingCode();
  const codeRef = doc(db, 'pairingCodes', code);
  
  // Create a temporary document that expires naturally or gets deleted upon pairing
  await setDoc(codeRef, {
    creatorId: userId,
    creatorInfo: userInfo,
    createdAt: serverTimestamp(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
  });
  
  return code;
};

/**
 * User B calls this when entering the code they received from User A.
 * We use a Firebase Transaction to guarantee that:
 * 1. The code is only used once.
 * 2. Both users receive the coupleId simultaneously.
 * 3. The master couple document is securely initialized.
 * 
 * @param {string} enteredCode - The 6 digit code
 * @param {string} currentUserId - User B's Firebase Auth ID
 * @param {Object} currentUserInfo - User B's metadata
 * @returns {Promise<string>} The new coupleId generated
 */
export const pairUsers = async (enteredCode, currentUserId, currentUserInfo) => {
  // Ensure we format it correctly just in case
  const formattedCode = enteredCode.trim().toUpperCase();
  const codeRef = doc(db, 'pairingCodes', formattedCode);
  
  try {
    const coupleId = await runTransaction(db, async (transaction) => {
      const codeDoc = await transaction.get(codeRef);
      if (!codeDoc.exists()) {
        throw new Error("Invalid or expired pairing code.");
      }
      
      const data = codeDoc.data();
      const userAId = data.creatorId;
      const userAInfo = data.creatorInfo;
      
      if (userAId === currentUserId) {
        throw new Error("You cannot pair with yourself.");
      }

      // Generate a new, unique couple ID by creating a document reference
      const newCoupleRef = doc(collection(db, 'couples'));
      const newCoupleId = newCoupleRef.id;

      // 1. Initialize the Master 'Couples' Document
      transaction.set(newCoupleRef, {
        users: {
          [userAId]: userAInfo,
          [currentUserId]: currentUserInfo
        },
        created_at: serverTimestamp(),
        anniversaries: [],
        virtualPet: {
          type: 'cat',
          name: 'Mochi',
          hungerLevel: 100,
          happinessLevel: 100,
          lastFed: serverTimestamp()
        }
      });

      // 2. Link User A to the Couple ID
      const userARef = doc(db, 'users', userAId);
      transaction.set(userARef, { coupleId: newCoupleId }, { merge: true });

      // 3. Link User B to the Couple ID
      const userBRef = doc(db, 'users', currentUserId);
      transaction.set(userBRef, { coupleId: newCoupleId }, { merge: true });

      // 4. Consume/Delete the pairing code to prevent reuse
      transaction.delete(codeRef);

      return newCoupleId;
    });

    return coupleId;
  } catch (error) {
    console.error("Pairing transaction failed: ", error);
    throw error;
  }
};
