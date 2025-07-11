import CryptoJS from "crypto-js";

const secretKey = "mebe23";
const Encrypt = (word, key = secretKey) => {
  console.log("=== ENCRYPT DEBUG (encrypt.js) ===");
  console.log("Input word:", word);
  console.log("Key used:", key);

  try {
    let encJson = CryptoJS.AES.encrypt(JSON.stringify(word), key).toString();
    console.log("AES encrypted JSON:", encJson);

    let encData = CryptoJS.enc.Base64.stringify(
      CryptoJS.enc.Utf8.parse(encJson)
    );
    console.log("Base64 encoded:", encData);

    return encData;
  } catch (error) {
    console.log("❌ Encrypt error:", error.message);
    return null;
  }
};

export default Encrypt;
