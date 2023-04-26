#!/bin/bash

# List the largest files being hosted.
find ~/[!.]* ~/* -type f -exec du -sh {} + | sort -hr | head -n 30