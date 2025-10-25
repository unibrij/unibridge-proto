export default async function handler(req, res){
  if (req.method !== "POST") return res.status(405).json({error:"method_not_allowed"});
  if (req.headers["x-api-key"] !== process.env.API_KEY) return res.status(401).json({error:"unauthorized"});

  const { src="US", dst="BR", ccy="USD", amt=1250, bkd_id } = req.body||{};
  const fx = (ccy==="USD" && dst==="BR") ? 5.21 : 1.0;
  const fee = 2.90;
  const payload = {
    route:{ hops:[
      { node:"Origin/US", type:"bank", latency_ms:120 },
      { node:"BKD/Directory", type:"bkd", latency_ms:35 },
      { node:"MoneyGram/BR", type:"mto", latency_ms:220 }
    ], static:true },
    quote:{
      fx_rate:fx, fee_fixed:fee, delivery_eta_s:86400,
      amount_src:+amt, amount_dst: Math.round((+amt*fx - fee)*100)/100,
      currency_dst: dst==="BR" ? "BRL" : ccy
    },
    generated_at: new Date().toISOString()
  };
  return res.status(200).json(payload);
}
