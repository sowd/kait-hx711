// Estimate raw value -> gram mapping by Gram = a * RawValue + b
// Using least square fitting
// https://qiita.com/quzq/items/c1a4929f47d986b0f77f

const A1 = [ // y:gram,  x:value
	{y:474,x:235000},
	{y:426,x:208030},
	{y:356,x:175050},
	{y:288,x:142640},
	{y:178,x:87760},
	{y:115,x:60050},
	{y:32,x:22900},
	//{y:0,x:880},
	{y:0,x:1176},


	{y:1357.1, x:666058.5},
	{y:751.2, x:367988.4},
	{y:1936.7, x:947670.1},
	{y:1005.5, x:492506.9},
	{y:1551.6, x:759360.6},
	{y:2788.6, x:1366549.6},
	{y:1649.0, x:807073.7},
	{y:1357.1, x:664450}

].reverse();
const B1 = [ // y:gram,  x:value
	{y:474,x:54650},
	{y:426,x:48630},
	{y:356,x:40820},
	{y:288,x:33065},
	{y:178,x:20395},
	{y:115,x:13547},
	{y:32,x:5060},
	//{y:0,x:-10},
	{y:0,x:15},


	{y:1357.1, x:156257.5},
	{y:1649, x:190363.5},
	{y:2782.4, x:322056.9},
	{y:1551.8, x:178002.5},
	{y:1005.8, x:115543.8},
	{y:761.1, x:87862.9},
	{y:1927.1, x:222029.7},

].reverse();

const A2 = [ // y:gram,  x:value
	{y:474,x:210850},
	{y:426,x:188000},
	{y:356,x:157160},
	{y:288,x:129450},
	{y:178,x:78065},
	{y:115,x:52000},
	{y:32,x:17365},
	//{y:0,x:-450},
	{y:0,x:-955},


	{y:1927.1, x:857288.8},
	{y:760.6, x:339558},
	{y:1005.8, x:447046.1},
	{y:1551.4, x:688513.8},
	{y:2788.9, x:1235274.6},
	{y:1649.5, x:731839.1},
	{y:1357, x:603110.9},
].reverse();
const B2 = [ // y:gram,  x:value
	{y:474,x:54890},
	{y:426,x:49225},
	{y:356,x:40930},
	{y:288,x:33445},
	{y:178,x:20750},
	{y:115,x:13737},
	{y:32,x:4725},
	//{y:0,x:70},
	{y:0,x:167},


	{y:1927.3, x:221289.5},
	{y:754.1, x:86601.7},
	{y:1005.9 ,x:115404.3},
	//{y:1261.7, x:178372.4},
	//{y:2644.2, x:319935.7},
	{y:1652.5, x:192652.3},
	{y:1357.1, x:156220.8},
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
let errs = [];

[A1,B1,A2,B2].forEach((dt,i)=>{
	const params = lsm(dt);
	console.log(`${names[i]}: (a,b)=(${params.a},${params.b})`);
	let e = 0;
	dt.forEach(d=>{
		const er = Math.pow(d.y-estimate(d.x,params),2);
		console.log(`Correct:${d.y}g , Estimated: ${Math.round(estimate(d.x,params))}g (err=${er})`);
		e += er;
	});
	errs.push(e);
});

// Python output
[A1,B1,A2,B2].forEach((dt,i)=>{
	const params = lsm(dt);
	console.log(`${names[i]}p = [${params.a},${params.b}] , err: ${errs[i]}`);
});

