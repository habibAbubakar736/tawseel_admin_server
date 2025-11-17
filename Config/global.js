exports.global = {
    get current_date() {
        return new Date()
    },
    'base_server_file_url': 'https://adminapi.tawseel.qa/',
};

exports.statusOptions = [
    { value: "0", label: "Pending" },
    { value: "1", label: "Accepted" },
    { value: "2", label: "Assigned Delivery" },
    { value: "3", label: "Picked" },
    { value: "4", label: "Delivered" },
    { value: "5", label: "Cancelled" },
]