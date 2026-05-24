import qrcode
import os

def generate_registration_qr(u_id, e_id):
    # Use an absolute path to ensure it lands in qr_images
    base_dir = os.path.dirname(os.path.abspath(__file__))
    qr_dir = os.path.join(base_dir, "qr_images")
    
    filename = f"qr_{u_id}_{e_id}.png"
    filepath = os.path.join(qr_dir, filename)

    img = qrcode.make(f"User:{u_id}, Event:{e_id}")
    img.save(filepath)
    print(f"Generated: {filepath}") # Check your terminal for this print!