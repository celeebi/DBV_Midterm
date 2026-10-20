"""
Launcher bootstrap script for PyInstaller executable packaging.
Enables compiling the Streamlit application into a standalone Windows .exe.
"""

import os
import sys
import streamlit.web.cli as stcli


def main():
    # Ensure working directory is set to project root
    base_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(base_dir)
    app_file = os.path.join(base_dir, "app.py")

    # Arguments to run Streamlit
    sys.argv = [
        "streamlit",
        "run",
        app_file,
        "--global.developmentMode=false",
        "--server.headless=false",
    ]
    sys.exit(stcli.main())


if __name__ == "__main__":
    main()
