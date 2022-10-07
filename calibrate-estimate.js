// Estimate raw value -> gram mapping by Gram = a * RawValue + b
// Using least square fitting
// https://qiita.com/quzq/items/c1a4929f47d986b0f77f

const A1 = [ // x:gram,  y:value
	{y:474,x:235000},
	{y:426,x:208030},
	{y:356,x:175050},
	{y:288,x:142640},
	{y:178,x:87760},
	{y:115,x:60050},
	{y:32,x:22900},
	//{y:0,x:880},
	{y:0,x:1176},
].reverse();
const B1 = [ // x:gram,  y:value
	{y:474,x:54650},
	{y:426,x:48630},
	{y:356,x:40820},
	{y:288,x:33065},
	{y:178,x:20395},
	{y:115,x:13547},
	{y:32,x:5060},
	//{y:0,x:-10},
	{y:0,x:15},
].reverse();
const A2 = [ // x:gram,  y:value
	{y:474,x:210850},
	{y:426,x:188000},
	{y:356,x:157160},
	{y:288,x:129450},
	{y:178,x:78065},
	{y:115,x:52000},
	{y:32,x:17365},
	//{y:0,x:-450},
	{y:0,x:-955},
].reverse();
const B2 = [ // x:gram,  y:value
	{y:474,x:54890},
	{y:426,x:49225},
	{y:356,x:40930},
	{y:288,x:33445},
	{y:178,x:20750},
	{y:115,x:13737},
	{y:32,x:4725},
	//{y:0,x:70},
	{y:0,x:167},
].reverse();


// 回帰直線を求める（最小二乗法）
function lsm(coordinates){
  const n = coordinates.length;
  const sigX = coordinates.reduce((acc, c) => acc + c.x, 0);
  const sigY = coordinates.reduce((acc, c) => acc + c.y, 0);
  const sigXX = coordinates.reduce((acc, c) => acc + c.x * c.x, 0);
  const sigXY = coordinates.reduce((acc, c) => acc + c.x * c.y, 0);
  // a(傾き)を求める
  const a = (n * sigXY - sigX * sigY) / (n * sigXX - Math.pow(sigX, 2));
  // b(切片)を求める
  const b = (sigXX * sigY - sigXY * sigX) / (n * sigXX - Math.pow(sigX, 2));
  return { a, b };
}

function estimate(x,params){
	return params.a * x + params.b;
}

//console.log(  estimate(0,lsm(A2)));


const names = ['A1','B1','A2','B2'];
[A1,B1,A2,B2].forEach((dt,i)=>{
	const params = lsm(dt);
	console.log(`${names[i]}: (a,b)=(${params.a},${params.b})`);
	dt.forEach(d=>{
		console.log(`Correct:${d.y}g , Estimated: ${Math.round(estimate(d.x,params))}g`);
	});
});

// Python output
[A1,B1,A2,B2].forEach((dt,i)=>{
	const params = lsm(dt);
	console.log(`${names[i]}p = [${params.a},${params.b}]`);
});

