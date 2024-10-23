 
async function Centers(request) {
    const Center = Parse.Object.extend("SmileCenters");
    const query = new Parse.Query(Center);
  
    // Optional filters: Center_Type, Zone, Services
    const { Center_Type, Zone, Services, Limit = 100, Page = 1 } = request.params;
    const skip = (Number(Page) - 1) * Number(Limit);  
  
    const allowedParams = ["Center_Type", "Zone", "Services", "Limit", "Page"];
    const paramsProvided = Object.keys(request.params);
  
    const invalidParams = paramsProvided.filter(param => !allowedParams.includes(param));
    if (invalidParams.length > 0) {
      throw new Parse.Error(Parse.Error.INVALID_QUERY, `Invalid parameters: ${invalidParams.join(", ")}. Only ${allowedParams.join(", ")} are allowed.`);
    }  
  
    if (Center_Type) {
      if (typeof Center_Type !== 'string') {
        throw new Parse.Error(Parse.Error.INVALID_QUERY, "Center_Type must be a valid string if provided");
      }
      query.equalTo("Center_Type", Center_Type);
    }
    
    if (Zone) {
      if (typeof Zone !== 'string') {
        throw new Parse.Error(Parse.Error.INVALID_QUERY, "Zone must be a valid string if provided");
      }
      query.equalTo("Zone", Zone);
    }  
  
    if (Services && typeof Services !== 'string') {
      throw new Parse.Error(Parse.Error.INVALID_QUERY, "Services must be a valid string if provided");
    } 
  
    query.limit(Limit);
    query.skip(skip);  
  
    try {
      const results = await query.find();
  
      const centers = results.map((center) => {
        let appointmentTypeId = center.get("Appointment_Type_Id");
  
        if (Services && center.get("Services")) {
          const servicesObj = center.get("Services");
          if (servicesObj[Services]){
            if(servicesObj[Services].AppointmentTypeId) {
            appointmentTypeId = servicesObj[Services].AppointmentTypeId;
            }          
          } else {
            return null
          }
        }        
  
        const {
          Center_Name: centerName,
          Country: country,
          City: city,
          Street: street,
          Neighborhood: neighborhood,
          Apt: apt,
          Number: number,
          Timetable: timeTable,
          promo,
          State: state,        
          Calendar_Id: calendarId,
          embed,
          Map_URL: mapUrl,      
          whatsAppLink,        
          Center_Type: centerType,
          Zone: zone,
          Services: services
        } = center.attributes;
  
        return {
          centerName,
          country,
          city,
          street,
          neighborhood,
          apt,
          number,
          timeTable,
          promo,
          state,        
          calendarId,
          embed,
          mapUrl,   
          whatsAppLink,        
          centerType,
          zone,
          services,
          appointmentTypeId,
        };
      });
  
      const filteredCenters = centers.filter(center => center !== null);   
  
     return {
        code: 200,
        message: filteredCenters
     }      
      
    } catch (error) {
      //throw new Parse.Error(Parse.Error.SCRIPT_FAILED, error.message || "An unexpected error occurred.");
      if (error instanceof Parse.Error) {
        return {
          code: error.code || 400,
          message: error.message || "An unexpected error occurred.",
        };
      } else {
        return {
          code: 500,
          message: "An unexpected error occurred.",
        };
      }
    }
  }
  
  module.exports = Centers;
  