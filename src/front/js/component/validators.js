
// import phoneRegex from '../store/phoneRegex';




export const ValidateEmail = (email, setInvalidItems) => {
    let validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if (email.match(validRegex)) {
        return true;
    } else {
        setInvalidItems(prevInvalidItems => [...prevInvalidItems, "email"]);
        return false;
    }
};
// export const ValidatePhone = (phone, setInvalidItems) => {
//     // Define a regex pattern for phone numbers
//     const phoneRegex = /^\+?[1-9]\d{1,14}$/; // E.164 format (optional "+" prefix, up to 15 digits)

//     if (!phoneRegex.test(phone)) {
//         setInvalidItems(prevInvalidItems => [...prevInvalidItems, "phone"]);
//         return false;
//     }
//     return true;
// };


// export const ValidatePhone = (phoneNumber, countryCode, setInvalidItems) => {
//     const regex = phoneRegex[countryCode];
//     // leave the 3 console log statements below for testing purposes:
//     // console.log(countryCode);
//     // console.log(phoneNumber)
//     // console.log("regex:", regex);
//     if (!regex || !regex.test(phoneNumber)) {
//         setInvalidItems(prevInvalidItems => [...prevInvalidItems, "phone"]);
//         return false;
//     }
//     return true;
// };
// export const ValidatePhoneNumber = (phoneNumber, country) => {
//     console.log(country);
//     console.log(phoneNumber);
//     const regex = phoneRegex[country];
//     console.log("regex:", regex);
//     if (!regex) {
//         return { isValid: false, message: 'Invalid country code or phone number format' };
//     }
//     if (regex.test(phoneNumber)) {
//         return { isValid: true, message: '' };
//     } else {
//         return { isValid: false, message: 'Invalid phone number' };
//     }
// };
export const ValidateUserName = (user_name, setInvalidItems) => {
    if (user_name.trim() === "" || user_name.length < 6 || user_name.length > 25) {
        setInvalidItems(prevInvalidItems => [...prevInvalidItems, "user_name"]);
        return false;
    }
    return true;
};
export const ValidateLastName = (last_name, setInvalidItems) => {
    if (last_name.trim() === "" || last_name.length < 2 || last_name.length > 25) {
        setInvalidItems(prevInvalidItems => [...prevInvalidItems, "last_name"]);
        return false;
    }
    return true;
};











