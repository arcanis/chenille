MASTER=master
MERGE_QUEUE=merge-queue

setup_repo() {
    git init .
    git commit --allow-empty -m 'First commit'
    git checkout -b "$MERGE_QUEUE"
    git checkout "$MASTER"
}

open_feature() {
    git checkout -b "$1" master
    touch "$1"
    git add .
    git commit -m "Adds ${1}"
}

send_to_merge_queue() {
    git checkout "$MERGE_QUEUE"
    git merge --squash "$2"
    printf "%s\n\n%s" "$1" "$(cat .git/SQUASH_MSG)" > .git/SQUASH_MSG
    git commit -F .git/SQUASH_MSG
}

commit_merge_queue() {
    git checkout "$MASTER"
    git reset --hard "$MERGE_QUEUE"
}
