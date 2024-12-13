#!/bin/bash

# Input and output directories
SOURCE_DIR="/home/syy/dev/TrueSwiftie/tsbackend/media/songs"
DEST_DIR="/home/syy/dev/TrueSwiftie/tsbackend/media/songs_compressed"

# Create the destination directory if it doesn't exist
mkdir -p "$DEST_DIR"

# Target size in MB
TARGET_SIZE_MB=3

# Function to calculate bitrate for the target size
calculate_bitrate() {
    local duration=$1
    local target_size=$2
    # Convert target size to bits (1 MB = 8,000,000 bits)
    local target_size_bits=$((target_size * 8000000))
    # Calculate bitrate (bits per second)
    echo $((target_size_bits / duration))
}

# Process each MP3 and FLAC file
find "$SOURCE_DIR" -type f \( -iname "*.mp3" -o -iname "*.flac" \) | while read -r file; do
    # Get the file's duration in seconds
    duration=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$file")
    duration=${duration%.*} # Round down to integer

    # Skip if duration could not be determined
    if [ -z "$duration" ]; then
        echo "Could not determine duration for $file. Skipping."
        continue
    fi

    # Calculate the bitrate for the target size
    bitrate=$(calculate_bitrate "$duration" "$TARGET_SIZE_MB")
    
    # Ensure the bitrate is within reasonable limits
    if [ "$bitrate" -lt 32000 ]; then
        bitrate=32000 # Set a minimum bitrate (32 kbps) to avoid extremely poor quality
    fi

    # Extract the filename and extension
    filename=$(basename "$file")
    extension="${filename##*.}"
    base="${filename%.*}"

    # Set the output file path
    output_file="$DEST_DIR/$filename"

    # Compress the file
    echo "Compressing $file to $output_file with bitrate ${bitrate}bps"
    ffmpeg -i "$file" -b:a "${bitrate}k" "$output_file" -y
done
