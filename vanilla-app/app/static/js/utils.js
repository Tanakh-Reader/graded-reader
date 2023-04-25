function contextToJson(context) {
    context = context.replace(/'/g, '"').replace(/None/g, null);
    return JSON.parse(context);
  }