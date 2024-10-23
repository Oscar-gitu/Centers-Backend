async function centers(request) {
    const Center = Parse.Object.extend("SmileCenters");
    const query = new Parse.Query(Center);
  
    // Optional filters: center_type, zone, services
    const { center_type, zone, services: requestedServices, limit = 100, page = 1 } = request.params;
    const skip = (Number(page) - 1) * Number(limit);
  
    const allowedParams = ["center_type", "zone", "services", "limit", "page"];
    const paramsProvided = Object.keys(request.params);
  
    const invalidParams = paramsProvided.filter(param => !allowedParams.includes(param));
    if (invalidParams.length > 0) {
      throw new Parse.Error(Parse.Error.INVALID_QUERY, `Invalid parameters: ${invalidParams.join(", ")}. Only ${allowedParams.join(", ")} are allowed.`);
    }
  
    if (center_type) {
      if (typeof center_type !== 'string') {
        throw new Parse.Error(Parse.Error.INVALID_QUERY, "center_type must be a valid string if provided");
      }
      query.equalTo("Center_Type", center_type);
    }
  
    if (zone) {
      if (typeof zone !== 'string') {
        throw new Parse.Error(Parse.Error.INVALID_QUERY, "zone must be a valid string if provided");
      }
      query.equalTo("Zone", zone);
    }
  
    if (requestedServices && typeof requestedServices !== 'string') {
      throw new Parse.Error(Parse.Error.INVALID_QUERY, "services must be a valid string if provided");
    }
  
    query.limit(limit);
    query.skip(skip);
  
    try {
      const results = await query.find();
  
      const centers = results
        // First, filter out those centers that do not have the desired service (if specified)
        .filter((center) => {
          if (requestedServices && center.get("Services")) {
            const servicesObj = center.get("Services");
            // If the service exists, let it pass; if not, exclude it
            return servicesObj[requestedServices] ? true : false;
          }
          return true; // If no service is specified, let all centers pass
        })
        // Then, transform the filtered centers
        .map((center) => {
          let appointmentTypeId = center.get("Appointment_Type_Id");
  
          if (requestedServices && center.get("Services")) {
            const servicesObj = center.get("Services");
            if (servicesObj[requestedServices] && servicesObj[requestedServices].AppointmentTypeId) {
              appointmentTypeId = servicesObj[requestedServices].AppointmentTypeId;
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
  
      return {
        code: 200,
        message: centers
      }
  
    } catch (error) {
      if (error instanceof Parse.Error) {
        return {
          code: error.code || 400,
          message: error.message || "An unexpected error occurred.",
        };
      } else {
        return {
          code: 500,
          message: error.message || "An unexpected error occurred.",
        };
      }
    }
  }
  
  module.exports = centers;