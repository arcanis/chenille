#!/usr/bin/env

set -e
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

source "$HERE"/_base.sh
setup_repo

open_feature feature1
open_feature feature2
open_feature feature3
open_feature feature4
open_feature feature5
open_feature feature6

send_to_merge_queue '[#1] Feature 1' feature1
send_to_merge_queue '[#2] Feature 2' feature2
send_to_merge_queue '[#3] Feature 3' feature3
send_to_merge_queue '[#4] Feature 4' feature4
send_to_merge_queue '[#5] Feature 5' feature5
send_to_merge_queue '[#6] Feature 6' feature6

commit_merge_queue
