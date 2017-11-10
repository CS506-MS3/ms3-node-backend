function propertiesMiddleware(datastore, errorResponse, CONFIG) {
    'use strict';

    const ENTITY_KEY = CONFIG.ENTITY_KEYS.PROPERTIES;
    const OPTIONS_ENTITY_KEY = CONFIG.ENTITY_KEYS.PROPERTY_OPTIONS;

    return {
        create,
        getOptions
    };

    function create(req, res, next) {

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