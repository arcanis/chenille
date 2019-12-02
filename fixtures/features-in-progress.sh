#!/usr/bin/env

set -e
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

source "$HERE"/_base.sh
setup_repo

open_feature feature1
open_feature feature2
open_feature feature3
