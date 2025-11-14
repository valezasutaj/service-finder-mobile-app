export const categoryIcons = {
    "plumbing_repair_services.jpg": require("../assets/images/categories/plumbing_repair_services.jpg"),
    "electrician_services.jpg": require("../assets/images/categories/electrician_services.jpg"),
    "painting_services.jpg": require("../assets/images/categories/painting_services.jpg"),
    "car_tow_services.jpg": require("../assets/images/categories/car_tow_services.jpg"),
    "cleaning_services.png": require("../assets/images/categories/cleaning_services.png"),
};

export const defaultCategoryIcons = [
    categoryIcons["plumbing_repair_services.jpg"],
    categoryIcons["electrician_services.jpg"],
    categoryIcons["painting_services.jpg"],
    categoryIcons["car_tow_services.jpg"],
    categoryIcons["cleaning_services.png"],
];

const getRandomDefault = () => {
    const index = Math.floor(Math.random() * defaultCategoryIcons.length);
    return defaultCategoryIcons[index];
};

export const getCategoryIcon = (icon) => {
    if (!icon) return getRandomDefault();
    return categoryIcons[icon] ?? getRandomDefault();
};
