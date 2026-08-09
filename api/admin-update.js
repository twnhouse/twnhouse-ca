import{Pool}from'pg';
const pool=new Pool({connectionString:process.env.POSTGRES_URL});
export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if(req.method==='OPTIONS')return res.status(200).end();
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  try{
    const{id,type,...fields}=req.body;
    if(!id||!type)return res.status(400).json({error:'id and type required'});
    const table=type==='tenant'?'tenant_profiles':'landlord_profiles';
    const allowed=type==='tenant'
      ?['first_name','last_name','email','phone','city','budget','property_type','bedrooms','pets','occupants','employment_status','lifestyle','lease_length','move_in_date','photo_id_uploaded','notes','credit_consent']
      :['first_name','last_name','email','phone','address','property_type','bedrooms','bathrooms','rent','available_date','lease_length','included_utilities','tenant_type','pets_allowed','smoking','plan','photo_id_uploaded','notes'];
    const updates=Object.entries(fields).filter(([k])=>allowed.includes(k));
    if(!updates.length)return res.status(400).json({error:'No valid fields to update'});
    const setClauses=updates.map(([k],i)=>`${k}=$${i+1}`).join(',');
    const values=[...updates.map(([,v])=>v===''?null:v),id];
    await pool.query(`UPDATE ${table} SET ${setClauses} WHERE id=$${values.length}`,values);
    return res.status(200).json({success:true});
  }catch(err){return res.status(500).json({error:'Update failed',details:err.message});}
}
