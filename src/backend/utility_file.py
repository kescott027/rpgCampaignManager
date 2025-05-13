"""
A collection of utilities for common file handling operations
json_loader = reused code for loading a json file to memory
"""
import os
import json
import logging


logging.basicConfig(level=logging.DEBUG)


def json_loader(file_path, op='r'):
    logging.debug(f'utility_file.json_loader starting...')
    try:
        logging.debug(f'json loader loading from path {file_path}')
        if not os.path.exists(file_path):
            logging.error(f"utility_file.json_loader is unable to find file {file_path}.  No object returned")

        with open(file_path, op) as f:
            logging.debug(f"utility_file.json_loader: opening file {file_path}")
            json_file = json.load(f)
            logging.debug(f"json file {file_path} complete: {json_file}")

            return json_file

    except FileNotFoundError:
        logging.error(
            f"Error utility_file.json_loader: Error: File not found: {file_path}")
        return None

    except json.JSONDecodeError:
        logging.error(
            f"Error: utility_file.json_loader: Invalid JSON format in file: {file_path}")
        return None

    except Exception as error:
         logging.error(
            f"Error: utility_file.json_loader: An unexpected error occurred: {error}")
         return None


def project_root():

    current_dir = os.path.dirname(os.path.abspath(__file__))

    while True:
        if any(
            os.path.exists(os.path.join(current_dir, marker))
            for marker in [".git", "pyproject.toml", "setup.py"]
        ):
            return current_dir

        parent_dir = os.path.dirname(current_dir)

        if parent_dir == current_dir:
            raise FileNotFoundError("Project root not found.")

        current_dir = parent_dir


def write_file(file):

    try:
        with open(filename, "w", encoding="utf-8") as file:
            file.write(data)

        logging.info(f"Successfully wrote data to '{filename}'")

    except Exception as e:
        logging.error(f"An error occurred: {e}")


def open_file(file):

    try:
        with open(file_path, "r", encoding="utf-8") as file:
            content = file.read()

        logging.info(f"opened file {file_path} in read mode")
        return content

    except FileNotFoundError:
        logging.error(f"Error: File not found at path: {file_path}")
        return None

    except Exception as e:
        logging.error(f"An error occurred: {e}")
        return None
