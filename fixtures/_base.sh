MASTER=master
MERGE_QUEUE=merge-queue

export GIT_AUTHOR_NAME=Example
export GIT_AUTHOR_EMAIL=postmaster@example.org

export GIT_COMMITTER_NAME="$GIT_AUTHOR_NAME"
export GIT_COMMITTER_EMAIL="$GIT_AUTHOR_EMAIL"

setup_repo() {
    git init .
    git commit --allow-empty -m 'First commit'
    git checkout -b "$MERGE_QUEUE"
    git checkout "$MASTER"

    ORIGIN=$(mktemp -d)
    git clone --mirror . "$ORIGIN"
    git remote add origin "$ORIGIN"
}

setup_chenille() {
    cat > chenille.yml
    git add chenille.yml
    git commit -m 'Updates the Chenille configuration'
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
