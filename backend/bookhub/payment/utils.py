# payment/utils.py (recommended place for helper functions)

import hmac
import hashlib
import base64

def generate_signature(secret_key, params_string):
    secret_key_bytes = secret_key.encode('utf-8')
    message = params_string.encode('utf-8')
    digester = hmac.new(secret_key_bytes, message, hashlib.sha256)
    signature = base64.b64encode(digester.digest()).decode()
    return signature
