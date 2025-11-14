export const categoryIcons = {
    "plumbing_repair_services.jpg": require("../assets/images/categories/plumbing_repair_services.jpg"),
    "electrician_services.jpg": require("../assets/images/categories/electrician_services.jpg"),
    "painting_services.jpg": require("../assets/images/categories/painting_services.jpg"),
    "car_tow_services.jpg": require("../assets/images/categories/car_tow_services.jpg"),
    "cleaning_services.png": require("../assets/images/categories/cleaning_services.png"),
};

export const defaultCategoryIcon = require("../assets/images/categories/default.png");

export const getCategoryIcon = (icon) => {
    if (!icon) return defaultCategoryIcon;
    return categoryIcons[icon] ?? defaultCategoryIcon;
};
