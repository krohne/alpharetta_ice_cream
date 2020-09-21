const axios = require('axios');

const API_key = "LOP-cVYckWnYkYzc2WezJv3CpsuWc_G29ZbbvUTR3wWZchxTjkmgAnF3djdk_mA6Z3HWMYanaIJUMe2ycom3USPhn4a1i7ggGuJ8GM5b00xX2e_3_MAQtbW5M7doX3Yx";

async function getFirstReview(shop) {
    const { id = null, review_count = 0 } = shop || {};
    let name =null,
        text = null;
        
    // There might be no reviews for this shop yet, right?
    // No need to do a REST call for 0 reviews
    if (review_count === 0 || id === null) {
        return {
            ...shop,
            review: {
                text,
                name
                }
        };
    }

    try {
            
            ( { 
                data: {
                    // destructuring the array of reviews to get just the 1st one
                    reviews: [ { 
                        text = null,
                        user: {
                            name = null
                        } = {}
                    } = {}   // We checked for 0 reviews earlier, but just in case, you know?
                    ]
                }
            } = await axios.get(`https://api.yelp.com/v3/businesses/${id}/reviews`, {
                        headers: {
                        Authorization: `Bearer ${API_key}`
                        }
                    }
                ) );
                
    } catch (err) {
        console.err(err);
    }
    
    return {
        ...shop,
        review: {
            text,
            name
            }
    };
}

// Could do this as async IIFE, instead
async function getTop5() {
    let shopsWithReviews = [];
    try {
        const { 
            data: {
                businesses
            }
        } = await axios.get('https://api.yelp.com/v3/businesses/search', {
                headers: {
                    Authorization: `Bearer ${API_key}`
                    },
                params: {
                  categories: 'icecream',
                  location: 'Alpharetta, GA',
                  limit: 5,
                  sort_by: 'rating'
                }
              });
              
        // There might no ice cream shops, right?
        if (businesses.length === 0) return businesses;
        
        // Just the properties we need, please
        const shops = businesses.map( ( { 
            id, 
            name, 
            review_count, 
            location: { 
                address1, 
                address2, 
                address3, 
                city, 
                state 
            }
        } ) => ( { 
            id, 
            name, 
            review_count, 
            address1, 
            address2, 
            address3, 
            city, 
            state
        } ) );
        
        // Who wants to wait for them to run 1 by 1? Let's run them simultaneously!
        const promises = shops.map( async(shop) => getFirstReview(shop) );        
        const settled = await Promise.allSettled(promises);
        
        // Promise.allSettled() returns status and value (if successful); we only need the value
        // Because we call our own function, we know the status is always "fulfilled"
        shopsWithReviews = settled.map( ( { value = null } ) =>  value );
    } catch (err) {
        console.error(err);
    }
        
    // console.log will sort the properties, but the requirement says 
    // "in the order received from the API response"
    console.log('Top 5 ice cream shops in Alpharetta, GA:', JSON.stringify(shopsWithReviews, null, '  '));
    return shopsWithReviews;
}

getTop5();
