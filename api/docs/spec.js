import spec from "../_lib/openapi.js";
export default function handler(req, res){
  res.status(200).json(spec);
}
