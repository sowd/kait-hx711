// Estimate raw value -> gram mapping by Gram = a * RawValue + b
// Using least square fitting
// https://qiita.com/quzq/items/c1a4929f47d986b0f77f

///////////////////
// 2nd version

const A1 = [ // y:gram,  x:value
	{y:536.7,x:119043.8841},
	{y:1073.5,x:235314.8205},
	{y:1704.6,x:375916.2083},
	{y:3596.6,x:786844.8571},
	//{y:1934.5,x:403297.3939},
].reverse();

const B1 = [ // y:gram,  x:value
	{y:1934.5,x:215548.0333},
	{y:536.5,x:61855.07246},
	//{y:1167.6,x:122353.8933},
	//{y:1704.3,x:195891.2933},
	{y:2965.5,x:330613.8161}, // ?
	//{y:3596.6,x:229593.2619}, // ?
].reverse();

const A2 = [ // y:gram,  x:value
	//{y:1934.5,x:831297.1111},
	{y:536.5,x:231372.3444},
	{y:1167.6,x:516172.8611},
	{y:1704.3,x:750580.4293},
	{y:2965.5,x:1306530.192},
	{y:3596.6,x:1581331.674},
].reverse();
const B2 = [ // y:gram,  x:value
	{y:1073.5,x:60784.69841},
	{y:1704.6,x:96061.23297},
	{y:3596.6,x:198701.5556},
	{y:1934.5,x:108955.6984},
].reverse();

/*
///////////////////
// 1st version

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
	//{y:1652.5, x:192652.3},
	//{y:1357.1, x:156220.8},
].reverse();
*/
/*
// Error estimation
all:
A1p = [0.002047029475215862,-4.50840317421629] , err: 204.34630949982747
B1p = [0.008667032720886645,0.2777067962446386] , err: 370.5463062204966
A2p = [0.002255606511813044,-1.708339246909671] , err: 146.44865296253823
B2p = [0.008683382156625383,-2.3826792483242354] , err: 515.5468526377477

small part only:
A1p = [0.0020680475510323967,-7.459194297264942] , err: 139.76706622489525
B1p = [0.008817193618583824,-4.63981885658602] , err: 107.42820575134135
A2p = [0.0022655544150686335,-1.974251537515449] , err: 78.0603096445719
B2p = [0.00875250101106832,-4.737330347555451] , err: 42.66069367238944

large part only:
A1p = [0.0020413576787296794,0.29684091888044983] , err: 16.46908323022128
B1p = [0.008624509506561628,8.98808070617722] , err: 121.45411894121524
A2p = [0.0022618715195426844,-6.974586898361606] , err: 33.681494814283916
B2p = [0.00862668256174183,7.129320731078054] , err: 415.4452507124473
*/


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

// Python array output
console.log('Python array output');
[A1,B1,A2,B2].forEach((dt,i)=>{
	const params = lsm(dt);
	//console.log(`${names[i]}p = [${params.a},${params.b}]`);
	console.log(`${names[i]}p = [${params.a},${params.b}] # err = ${errs[i]}`);
});

