const PROPERTY_OPTION_TYPES = {
    AMENITIES: 'AMENITIES',
    PETS: 'PETS',
    HOUSE_RULES: 'HOUSE_RULES'
};

const propertyOptions = [
    {
        id: 1,
        type: PROPERTY_OPTION_TYPES.AMENITIES,
        alias: 'Elevator'
    },
    {
        id: 2,
        type: PROPERTY_OPTION_TYPES.AMENITIES,
        alias: 'Wi-fi'
    },
    {
        id: 3,
        type: PROPERTY_OPTION_TYPES.AMENITIES,
        alias: 'Internet'
    },
    {
        id: 4,
        type: PROPERTY_OPTION_TYPES.AMENITIES,
        alias: 'Kitchen'
    },
    {
        id: 5,
        type: PROPERTY_OPTION_TYPES.AMENITIES,
        alias: 'TV'
    },
    {
        id: 6,
        type: PROPERTY_OPTION_TYPES.AMENITIES,
        alias: 'Washer'
    },
    {
        id: 7,
        type: PROPERTY_OPTION_TYPES.AMENITIES,
        alias: 'Dryer'
    },
    {
        id: 8,
        type: PROPERTY_OPTION_TYPES.AMENITIES,
        alias: 'Free Parking'
    },
    {
        id: 9,
        type: PROPERTY_OPTION_TYPES.AMENITIES,
        alias: 'Paid Parking'
    },
    {
        id: 10,
        type: PROPERTY_OPTION_TYPES.AMENITIES,
        alias: 'A/C'
    },
    {
        id: 11,
        type: PROPERTY_OPTION_TYPES.AMENITIES,
        alias: 'Heating'
    },
    {
        id: 12,
        type: PROPERTY_OPTION_TYPES.AMENITIES,
        alias: 'Hot Tub'
    }, {
        id: 13,
        type: PROPERTY_OPTION_TYPES.AMENITIES,
        alias: 'Pool'
    },
    {
        id: 14,
        type: PROPERTY_OPTION_TYPES.AMENITIES,
        alias: 'Gym'
    },
    {
        id: 15,
        type: PROPERTY_OPTION_TYPES.AMENITIES,
        alias: 'Indoor Fireplace'
    },
    {
        id: 16,
        type: PROPERTY_OPTION_TYPES.AMENITIES,
        alias: 'Cable TV'
    },
    {
        id: 17,
        type: PROPERTY_OPTION_TYPES.AMENITIES,
        alias: 'Doorman'
    },
    {
        id: 18,
        type: PROPERTY_OPTION_TYPES.AMENITIES,
        alias: 'Bathtub'
    },
    {
        id: 19,
        type: PROPERTY_OPTION_TYPES.AMENITIES,
        alias: 'Game Console'
    },
    {
        id: 20,
        type: PROPERTY_OPTION_TYPES.PETS,
        alias: 'Has Dog'
    },
    {
        id: 21,
        type: PROPERTY_OPTION_TYPES.PETS,
        alias: 'Has Cat'
    },
    {
        id: 22,
        type: PROPERTY_OPTION_TYPES.PETS,
        alias: 'Has Other'
    },
    {
        id: 23,
        type: PROPERTY_OPTION_TYPES.HOUSE_RULES,
        alias: 'Dogs OK'
    },
    {
        id: 24,
        type: PROPERTY_OPTION_TYPES.HOUSE_RULES,
        alias: 'Cats OK'
    },
    {
        id: 25,
        type: PROPERTY_OPTION_TYPES.HOUSE_RULES,
        alias: 'Other Pets OK'
    },
    {
        id: 26,
        type: PROPERTY_OPTION_TYPES.HOUSE_RULES,
        alias: 'No Smoking'
    },
    {
        id: 27,
        type: PROPERTY_OPTION_TYPES.HOUSE_RULES,
        alias: 'No Drinking'
    },
    {
        id: 28,
        type: PROPERTY_OPTION_TYPES.HOUSE_RULES,
        alias: 'Couples OK'
    }
];

function addPropertyOptions(datastore, logger) {
    'use strict';

    const PROPERTY_ENTITY_KEY = 'PropertyOptions_1.0.0';

    const entities = propertyOptions.map((data) => {
        const timestamp = new Date().toJSON();

        return {
            key: datastore.key([PROPERTY_ENTITY_KEY, data.id]),
            data: {
                type: data.type,
                alias: data.alias,
                createTime: timestamp,
                updateTime: timestamp
            }
        };
    });
    datastore.save(entities)
        .then(() => {
            logger.info('Property Options Provisioned')
        })
        .catch((error) => {
            logger.error(error);
            logger.error('Property Options could not be added');
        });

}

const Datastore = require('@google-cloud/datastore');
const datastore = Datastore();
const logger = require('./core/logger');

addPropertyOptions(datastore, logger);

