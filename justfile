set shell := ["bash", "-eux", "-o", "pipefail", "-c"]

default: list
# List available targets.
list:
    just --list

fmt +treefmt_args="":
    treefmt  {{ treefmt_args }}
