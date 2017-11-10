const utils = require('../core/utils');

function propertiesMiddleware(datastore, errorResponse, CONFIG) {
    'use strict';

    const ENTITY_KEY = CONFIG.ENTITY_KEYS.PROPERTIES;
    const OPTIONS_ENTITY_KEY = CONFIG.ENTITY_KEYS.PROPERTY_OPTIONS;

    return {
        validateCreateForm,
        create,
        getOptions
    };

    function validateCreateForm(req, res, next) {
        const form = req.body;

        try {
            utils.throwIfFalse(validate(form.title, 'string', true), 'title field error');
            utils.throwIfFalse(validate(form.address, 'object', true), 'address field error');
            utils.throwIfFalse(validate(form.address.type, 'enum', true, {enumVal: ['APARTMENT', 'HOUSE']}), 'address field error');
            utils.throwIfFalse(validate(form.address.detailLevel1, 'string', true), 'address field error');
            utils.throwIfFalse(validate(form.address.detailLevel2, 'string', true), 'address field error');
            utils.throwIfFalse(validate(form.address.city, 'string', true), 'address field error');
            utils.throwIfFalse(validate(form.address.state, 'string', true), 'address field error');
            utils.throwIfFalse(validate(form.address.zipcode, 'string', true), 'address field error');
            utils.throwIfFalse(validate(form.address.geocode, 'object', true), 'address field error');
            utils.throwIfFalse(validate(form.address.geocode.lat, 'number', true), 'address field error');
            utils.throwIfFalse(validate(form.address.geocode.lng, 'number', true), 'address field error');
            utils.throwIfFalse(validate(form.roomType, 'enum', true, {enumVal: ['STUDIO', '1BR', '2BR', '3BR', '4BR']}), 'roomType field error');
            utils.throwIfFalse(validate(form.description, 'string', false), 'description field error');
            utils.throwIfFalse(validate(form.startDate, 'datetime', true), 'startDate field error');
            utils.throwIfFalse(validate(form.duration, 'number', true), 'duration field error');
            utils.throwIfFalse(validate(form.options, 'array', true), 'options field error');

            next();
        } catch (error) {
            errorResponse.send(res, 400, 'Form Invalid', error);
        }

    }

    function validate(input, type, required, options) {
        let typecheck = false;
        switch (type) {
            case 'string': {
                typecheck = typeof input === 'string';
                if (required) {
                    return typecheck;
                }
                break;
            }
            case 'enum': {
                typecheck = options.enumVal.includes(input);
                if (required) {
                    return typecheck;
                }
                break;
            }
            case 'number': {
                typecheck = !isNaN(parseFloat(input)) && isFinite(input);
                if (required) {
                    return typecheck;
                }
                break;
            }
            case 'object': {
                typecheck = typeof input === 'object' && !Array.isArray(input);
                if (required) {
                    return typecheck;
                }
                break;
            }
            case 'array': {
                typecheck = Array.isArray(input);
                if (required) {
                    return typecheck;
                }
                break;
            }
            case 'datetime': {
                typecheck = typeof input === 'string' && !isNaN(Date.parse(input));
                if (required) {
                    return typecheck;
                }
            }
        }
        return typecheck || typeof input === 'undefined';
    }

    function create(req, res, next) {
        const timestamp = new Date().toJSON();
        const form = req.body;
        form.status = false;
        form.owner = res.locals.decoded.data.id;
        form.imageUrls = [];
        form.createTime = timestamp;
        form.updateTime = timestamp;

        const key = datastore.key([ENTITY_KEY]);
        const userKey = datastore.key([CONFIG.ENTITY_KEYS.USERS, parseInt(res.locals.decoded.data.id)]);

        const property = {
            key: key,
            data: {
                status: false,
                title: form.title,
                address: form.address,
                roomType: form.roomType,
                description: form.description || '',
                startDate: form.startDate,
                duration: form.duration,
                price: form.price,
                options: form.options,
                imageUrls: [],
                owner: res.locals.decoded.data.id,
                createTime: timestamp,
                updateTime: timestamp
            }
        };

        datastore.save(property)
            .then(() => {
                return datastore.get(userKey);
            })
            .then((results) => {
                const user = results[0];

                if (!user.properties) {
                    user.properties = [key.id];
                } else {
                    user.properties = [...user.properties, key.id];
                }

                return datastore.save({
                    key: userKey,
                    data: user
                });
            })
            .then(() => {
                res.status(201).json({
                    message: 'Created'
                });
                return new Promise((resolve, reject) => resolve());
            })
            .catch((error) => {
                errorResponse.send(res, 500, 'Internal Server Error', error);
            });
    }

    function getOptions(req, res) {
        const query = datastore.createQuery(OPTIONS_ENTITY_KEY);

        datastore.runQuery(query)
            .then((response) => {
                const entities = response[0].map((entity) => {
                    return {
                        id: entity[datastore.KEY].id,
                        type: entity.type,
                        alias: entity.alias
                    };
                });

                res.status(200).json(entities);
            })
            .catch((error) => {

                errorResponse.send(res, 500, 'Internal Server Error', error);
            });
    }
}

module.exports = propertiesMiddleware;

/**
 *  PropertyOptions Entity
 *
 *  __key__=id:numeric
 *  {
 *      type: AMENITIES | HOUSE_RULES | PETS,
 *      alias: string
 *  }
 *
 *  Properties Entity
 *
 *  __key__=id:numeric
 *  {
 *      *status: boolean,
 *      *title: string,
 *      *address: {
 *          type: APARTMENT | HOUSE,
 *          detailLevel1: string,
 *          detailLevel2: string,
 *          city: string,
 *          state: string,
 *          zipcode: number,
 *          geocode: {
 *              lat: number,
 *              lng: number
 *          }
 *      },
 *      *roomType: STUDIO | 1BR | 2BR | 3BR | 4BR,
 *      description: string,
 *      *startDate: datetime,
 *      *duration: number,
 *      *price: number,
 *      options: PropertyOptions.__key__[],
 *      imageUrls: string[],
 *      *owner: User.__key__,
 *      *createdAt: datetime,
 *      *updatedAt: datetime
 *  }
 *
 *  PropertySummary
 *
 *  {
 *      title: string,
 *      address: string (_.detailLevel2 + _.city + _.state + _.zipcode,
 *      startDate: datetime,
 *      duration: number,
 *      price: number,
 *      imageUrls: string
 *  }
 *
 **/