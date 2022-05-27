import axios from "axios";

// Defines default headers for every request
const headers = {
  "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"101\", \"Google Chrome\";v=\"101\"",
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": "\"Linux\"",
  "Referer": "https://lospec.com/palette-list",
  "Referrer-Policy": "strict-origin-when-cross-origin"
}

// Object shape when using the search function
export interface inputParams {
  colorNumberFilterType: string,
  page: number,
  colorNumber?: number,
  tag?: string,
  sortingType?: string
}

// Object shape when sending request to Lospec's API
export interface requestParams {
  colorNumberFilterType: string,
  colorNumber: number,
  page: number,
  tag: string,
  sortingType: string
}

export const search = async (params: inputParams) => {
  // Lowercase for all string values
  for (const key of Object.keys(params)) {
    // @ts-ignore
    params[key] = typeof params[key] === "string" ? params[key].toLowerCase() : params[key];
  }

  let finalParams : requestParams = {
    colorNumberFilterType: "any",
    colorNumber: 8,
    page: 0,
    tag: "",
    sortingType: "default"
  };

  if (params?.colorNumberFilterType) {
    finalParams.colorNumberFilterType = params.colorNumberFilterType;
  }

  if (params?.colorNumber) {
    finalParams.colorNumber = params.colorNumber;
  }

  if (params?.page) {
    finalParams.page = params.page;
  }

  if (params?.tag) {
    finalParams.tag = params.tag;
  }

  if (params?.sortingType) {
    finalParams.sortingType = params.sortingType;
  }

  console.log("Requesting Lospec with params");
  console.log(finalParams);

  return await axios.get(`https://lospec.com/palette-list/load`, {
    "headers": headers,
    "params" : finalParams
  });
}
