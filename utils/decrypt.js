import CryptoJS from "crypto-js";
const secretKey = "mebe23";
export const decryptData = (queryParams) => {
  try {
    if (!queryParams) {
      return null;
    }

    const decData = CryptoJS.enc.Base64.parse(queryParams).toString(
      CryptoJS.enc.Utf8
    );
    const bytes = CryptoJS.AES.decrypt(decData, secretKey).toString(
      CryptoJS.enc.Utf8
    );

    // Parse JSON karena saat encrypt token di-JSON.stringify
    if (bytes) {
      try {
        return JSON.parse(bytes); // Return parsed JWT string
      } catch (e) {
        return bytes; // Fallback untuk backward compatibility
      }
    }

    return bytes;
  } catch (error) {
    console.log("❌ Decrypt error:", error.message);
    return null;
  }
};
