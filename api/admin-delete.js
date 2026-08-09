import{Pool}from'pg';
const pool=new Pool({connectionString:process.env.POSTGRES_URL});
export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if(req.method==='OPTIONS')return res.status(200).end();
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  try{
    const{id,type}=req.body;
    if(!id||!type)return res.status(400).json({error:'id and type required'});
    const table=type==='tenant'?'tenant_profiles':'landlord_profiles';
    await pool.query(`DELETE FROM ${table} WHERE id=$1`,[id]);
    return res.status(200).json({success:true});
  }catch(err){return res.status(500).json({error:'Delete failed',details:err.message});}
}
