"""
A utility script to format and lint HTML, JS, CSS, and JSON files.

For HTML:
    - Separates Django dynamic class tags from static classes.
    - Uses Prettier to format static class definitions.
    - Merges formatted static class definitions with dynamic class tags.
    - Uses djlint for further HTML formatting and reports linting issues.

    * The class sorting is according to `prettier-plugin-tailwindcss`

For JS, CSS, JSON:
    - Uses Prettier for formatting.

Usage: python lint.py <path_to_file>
"""

import os
import re
import subprocess


# Run a bash command as a subprocess
def run_command(command):
    result = subprocess.run(command, capture_output=True, text=True, shell=True)
    if "djlint" not in command and result.returncode != 0:
        raise Exception(f"Command failed: {command}\n{result.stderr}")
    return result.stdout


# Handle django class tages, e.g., class="mx-4 my-6 flex {{ program.bg_color }}"
def get_class_groups(pattern):
    static_parts, dynamic_parts = [], []
    if "{" in pattern:
        parts = pattern.split()

        # Using a simple FSM to detect dynamic parts encapsulated in {{ and }}
        capturing_dynamic = False
        dynamic_part = ""

        for part in parts:
            # beginning of django tag
            if "{{" in part:
                capturing_dynamic = True
                dynamic_part += part
            # end of django tag
            elif "}}" in part:
                capturing_dynamic = False
                dynamic_part += " " + part
                dynamic_parts.append(dynamic_part.strip())
                dynamic_part = ""
            # content in django tag
            elif capturing_dynamic:
                dynamic_part += " " + part
            else:
                static_parts.append(part)
        # format the data strings
        dynamic_parts_string = " ".join(dynamic_parts)
        static_parts_string = " ".join(static_parts)
        # only prepend with space if static classes are present
        if static_parts_string:
            dynamic_parts_string = " " + dynamic_parts_string
        # return the data in string form.
        return static_parts_string, dynamic_parts_string
    # no django tags present, return the normal classes and an empty string.
    return pattern, ""


def bulk_format_with_prettier(static_class_patterns):
    # Create a temporary HTML with all static class patterns
    temp_html_content = "\n".join(
        [f'<p class="{pattern}"></p>' for pattern in static_class_patterns]
    )

    # Send the entire content to prettier for formatting
    formatted_content = run_command(
        f"cd .. && echo '{temp_html_content}' | npx prettier --parser html"
    )

    # Extract all class patterns from formatted content
    return re.findall(r'class="([^"]*)"', formatted_content)


def format_html(file_path):
    with open(file_path, "r") as f:
        content = f.read()

    class_patterns = re.findall(r'class="([^"]*)"', content)

    # Split static and dynamic parts from all class patterns
    static_dynamic_pairs = [get_class_groups(pattern) for pattern in class_patterns]
    static_class_patterns = [pair[0] for pair in static_dynamic_pairs]

    # Get formatted static class patterns in bulk
    formatted_static_class_patterns = bulk_format_with_prettier(static_class_patterns)

    # Process the class patterns and replace them in content
    for pattern, (static_classes, dynamic_classes), formatted_static in zip(
        class_patterns, static_dynamic_pairs, formatted_static_class_patterns
    ):
        # Combine static and dynamic parts back
        combined_classes = f'class="{formatted_static}{dynamic_classes}"'

        # Replace in the content
        content = content.replace(f'class="{pattern}"', combined_classes, 1)

    with open(file_path, "w") as f:
        f.write(content)

    # Format using djlint
    run_command(f"djlint {file_path} --reformat")
    djlint_report = run_command(f"djlint {file_path}")
    print(djlint_report)


def format_js_css(file_path):
    run_command(f"cd .. && npx prettier --write {file_path}")
    print("Succesfully formatted with prettier")


def format_py(file_path):
    run_command(f"black {file_path}")
    print("Succesfully formatted with black")


def main(file_path):
    ext = os.path.splitext(file_path)[1].lstrip(".")

    if ext == "html":
        format_html(file_path)
    elif ext in ["js", "css", "json"]:
        format_js_css(file_path)
    elif ext == "py":
        format_py(file_path)
    else:
        # Handle other cases or just print a message saying unrecognized format
        print("Unaccepted file format! Try: [HTML, JS, CSS, JSON]")


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python lint.py <path_to_file>")
        sys.exit(1)

    main(sys.argv[1])
