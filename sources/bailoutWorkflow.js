exports.bailoutWorkflow = (output, message) => {
    output.write(message);
    return 0;
};
