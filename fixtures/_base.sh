MASTER=master
MERGE_QUEUE=merge-queue

AUTHOR_CONFIG=-c user.email=postmaster@example.org -c user.name=Example
AUTHOR_OPTION=--author="Example <postmaster@example.org>"

setup_repo() {
    git init .
    git $AUTHOR_CONFIG commit --allow-empty -m 'First commit' "$AUTHOR_OPTION"
    git checkout -b "$MERGE_QUEUE"
    git checkout "$MASTER"

    ORIGIN=$(mktemp -d)
    git clone --mirror . "$ORIGIN"
    git remote add origin "$ORIGIN"
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
