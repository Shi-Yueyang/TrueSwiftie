import os
import re
import ffmpeg
from mutagen import File
from mutagen.mp3 import MP3
from mutagen.id3 import ID3, TIT2, TPE1, TALB, TCON, TDRC

def sanitize_filename(filename):
    return re.sub(r'[^a-zA-Z0-9_]', '_', filename)

def convert_to_mp3(src_path, dest_dir):
    audio = File(src_path)
    if audio is None:
        print(f"Skipping file {src_path}, unable to read metadata.")
        return
    
    if src_path.endswith('.mp3'):
        title = audio.get('TIT2')
        artist = audio.get('TPE1')
    elif src_path.endswith('.flac'):
        title = audio.get('title')
        artist = audio.get('artist')
    
    if title and artist:
        filename = f"{artist[0]}_{title[0]}"
    elif title:
        filename = title[0]
    else:
        filename = os.path.splitext(os.path.basename(src_path))[0]
    
    filename = sanitize_filename(filename) + ".mp3"
    dest_path = os.path.join(dest_dir, filename)
    
    # Convert to mp3
    ffmpeg.input(src_path).output(dest_path, audio_bitrate='128k').run()
    
    # Copy metadata
    if title or artist:
        mp3_audio = MP3(dest_path, ID3=ID3)
        if title:
            mp3_audio['TIT2'] = TIT2(encoding=3, text=title[0])
        if artist:
            mp3_audio['TPE1'] = TPE1(encoding=3, text=artist[0])
        if 'album' in audio:
            mp3_audio['TALB'] = TALB(encoding=3, text=audio['album'][0])
        if 'genre' in audio:
            mp3_audio['TCON'] = TCON(encoding=3, text=audio['genre'][0])
        if 'date' in audio:
            mp3_audio['TDRC'] = TDRC(encoding=3, text=audio['date'][0])
        mp3_audio.save()
def process_directory(src_dir, dest_dir):
    for root, _, files in os.walk(src_dir):
        for file in files:
            if file.endswith(('.mp3', '.flac')):
                src_path = os.path.join(root, file)
                convert_to_mp3(src_path, dest_dir)
if __name__ == "__main__":
    src_dir = "/home/syy/dev/TrueSwiftie/music/"
    dest_dir = "/home/syy/dev/TrueSwiftie/music/b128/"
    
    if not os.path.exists(dest_dir):
        os.makedirs(dest_dir)
    
    process_directory(src_dir, dest_dir)