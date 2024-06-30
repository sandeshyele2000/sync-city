export function dateTimeConverter(dateString) {
    const givenDate = new Date(dateString);
    const currentDate = new Date();
    
    const timeDiff = currentDate - givenDate;
    
    const daysAgo = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    let monthsAgo = Math.floor(daysAgo / 30);
    let yearsAgo = Math.floor(daysAgo / 365);
    
    if (yearsAgo >= 1) {
        return `${yearsAgo} year${yearsAgo > 1 ? 's' : ''} ago`;
    } else if (monthsAgo >= 1) {
        return `${monthsAgo} month${monthsAgo > 1 ? 's' : ''} ago`;
    } else {
        return `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
    }
}
