/**
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
 *      amenities: Amenities.__key__[],
 *      pets: Pets.__key__[],
 *      houseRules: HouseRules.__key__[],
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