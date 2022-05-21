import axios from "axios";

const headers = {
  "accept": "*/*",
  "accept-language": "en-US,en;q=0.9,fr;q=0.8",
  "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"101\", \"Google Chrome\";v=\"101\"",
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-origin",
  "Referer": "https://lospec.com/palette-list/",
  "Referrer-Policy": "strict-origin-when-cross-origin"
}

export const search = async (
  colorNumberFilterType: string = "any",
  colorNumber: number | null,
  tag: string | null,
  sortingType : string = "default",
  page: number = 0
) => {
  return await axios.get(`https://lospec.com/palette-list/load`, {
    "headers": headers,
    "params" : {
      colorNumberFilterType,
      colorNumber,
      page,
      tag,
      sortingType
    }
  });
}
