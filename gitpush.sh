#!/bin/sh

# Check if a commit message was provided
if [ -z "$1" ]; then
  echo "Please provide a commit message."
  exit 1
fi

# Set the commit message
commit_msg="$1"

# Perform git operations
git add -A
git commit -m "$commit_msg"
git push