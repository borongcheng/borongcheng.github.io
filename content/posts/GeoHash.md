# GeoHash

# 一、定义

​		通常我们用经度纬度两个二维坐标点来精准表示一个位置，如果我们需要按位置范围查找，这样就得用遍历的形式，效率不高，所以引入了GeoHash算法，就是通过将经纬度编码，将二维转一维，给地理位置分区的一种算法。

> ​		GeoHash是一种地址编码的方法，他能够把二维的空间经纬度数据编码成一个字符串。

# 二、设计

​		我们知道地理坐标经度范围是东经180到西经180，纬度范围是南纬90到北纬90，我们设定西经为负，南纬为负，所以地球上的经度范围为[-180,180]，纬度范围为[-90,90]。

​		这样地球可以分成四个部分，如果纬度范围[-90,0]用二进制0表示，[0,90]用二进制1表示，经度范围[-180,0]用二进制0表示,[0,180]用二进制1表示。地球位置可以用如下表示：

![img](%E7%AC%94%E8%AE%B0%E5%9B%BE%E7%89%87/webp)

在小范围内递归对半划分（通过二进制数表示一个范围内的坐标）

![img](%E7%AC%94%E8%AE%B0%E5%9B%BE%E7%89%87/webp-20210901103047806)

> ​		可以看到划分的区域多了，也更精确了，GeoHash就是基于这种思想，划分的次数更多，区域更多，区域面积更小。通过经纬度坐标给位置分区。

# 三、算法

Geohash算法一共有三步：

## 1、计算二进制编码

​		根据坐标的经纬度来计算二进制编码，

​		纬度范围[-90,0]用二进制0表示，[0,90]用二进制1表示，经度范围[-180,0]用二进制0表示,[0,180]用二进制1表示。

例子：

​		给纬度39.928167进行二进制编码

* 区间[-90,90]进行二分为[-90,0),[0,90]，称为左右区间，可以确定39.928167属于右区间[0,90],标记1；
* 将区间[0,90]进行二分[0,45),[45,90]，可以确定目标在[0,45)区间，所以标记为0；
* 递归上述过程，39.928167总是属于某个区间[a,b]。随着每次迭代区间[a,b]总在缩小，并且逼近39.928167。
* 最后39.928167的二进制编码是1011100，编码的长度于递归的次数有关，编码越长精度越高。



## 2、进行组码

​		在对经纬度进行编码之后会获得两个与之对应的二进制数，通过规则偶数放经度，奇数放纬度的方式将两个二进制数组合成一个新的二进制数。

## 3、进行Base32编码

​		Base32编码是用0-9、b-z（去掉a、i、l、o）组成的32个字母进行编码。

​		具体操作就是将上一步得到的合并成的二进制数转换成十进制数，然后对应生成Base32码，需要注意的是5个二进制位转换成一个Base32码。

> 当GeoHash的Base32码长度为8时，精度在19米左右，而当编码长度为9时，精度在2米左右，编码长度需要根据实际需求来定。



## 4、算法思想

​		如图所示，我们将二进制编码的结果填写到空间中，当将空间划分为四块的时候，编码的顺序分别是左下角00，左上角01，右下角10，右上角11，也就是类似于Z的曲线。

​		当我们递归的将各个块分解成更小的子块时，编码的顺序是自相似的（分形），每个子块也形成Z曲线，这种类型的曲线被称为Peano空间填充曲线。

> Peano空间曲线的优点：将二维空间转换成了一维曲线（事实上是分形堆）。
>
> 
>
> Peano空间曲线的特点：对大部分而言，编码相似距离也相近，但Peano空间填充曲线最大的缺点就是突变性，有些编码相邻却相差很远。

# 四、具体实现

## 1、编码

```java
private final static Integer number = 3*4  //经纬度单独编码长度相乘
//base32编码的字符数组。
private final static char[] digits = { '0', '1', '2', '3', '4', '5', '6', '7', '8',
        '9', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'j', 'k', 'm', 'n', 'p',
        'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z' };
  
//先通过二分法去根据数据的区间，将经纬度转0，1数字组合
public String encode(double lat,double lon){
  //给定区间，给定经纬度，转成二进制表示数
  BitSet latbits = getBites(lat,-90,90);
  BitSet lonbits = getBites(lon,-180,180);
  //将BitSet记录的数据转成二进制的形式
  //同时经纬度BitSet交叉转换
  StringBuffer buffer = new StringBuffer();
  for(int i = 0; i < number; i++){
    buffer.append((lonbits.get(i))?'1':'0');
		buffer.append((latbits.get(i))?'1':'0');
  }
  //将二进制编码进行base32经纬度编码转换
  String code = base32(Long.parseLong(buffer.toString(),2));
  return code;
}



//根据经纬度范围，获取对应的二进制数
private BiteSet getBites(double lat,double floor,double ceiling){
  BitSet buffer = new BitSet(number);
  for(int i = 0; i < number; i++){
    double mid = (floor + ceiling) / 2;
    //通过BitSet存值，将处于经纬度处于正区间的下标记录在BitSet中
    if(lat >= mid){
      buffer.set(i);
      floor = mid;
    }else{
      celing = mid;
    }
  }
  return buffer;
}

//将经纬度合并之后的数进行base32编码
private String base32(long i){
  char[] buf = new char[65];
  int charPos = 64;
  boolean negative = (i < 0);
  if(!negative){
    i = -i;
  }
  //主要思想就是先将二进制数转三十二进制，然后通过这个数检索编码下标
  while(i <= -32){
    buf[charPos--] = digits[(int)(-(i%32))];
    i/=32;
  }
  buf[charPos] = digits[(int)(-i)];
  if(negative){
    buf[--charPos] = '-';
  }
  return new String(buf,charPos,(65-charPos));
}
```

## 2、获取范围geoHash编码

​		根据传入的左上和右下的点，外接一个盒模型获取范围内的geoHash。

```java
/**
 * @descirption: 根据传入的最左最下点和最上最右点获取指定范围内的geoHash集合
 * @param maxLat  左上纬度
 * @param minLng  左上经度
 * @param minLat  右下经度
 * @param maxLng  右下纬度
 * @param precision 精度
 * @author: chengborong
 * @time 2021/09/02
 * */
public static HashSet<String> getGeoHashByFence(double maxLat,double minLat,double maxLng,int precision){
  //通过矩形的左下角构建一个精度为precision的geoHash
  GeoHash southWestCorner = GeoHash.withCharacterPrecision(minLat,minLng,precision);
  //通过矩形右上角构建一个精度为precision的geoHash
  GeoHash northEastCorner = GeoHash.withCharacterPrecision(maxLat,maxLng,precision);
  //使用这两个geoHash构建一个外接盒模型
  TwoGeoHashBoundingBox twoGeoHashBoundingBox = new TwoGeoHashBoundingBox(southWestCorner, northEastCorner);
  //获得盒模型中的迭代器，遍历盒中的所有geoHash
  HashSet<String> set = new HashSet<>();
  BoundingBoxGeoHashIterator boundingBoxGeoHashIterator = new BoundingBoxGeoHashIterator(twoGeoHashBoundingBox);
  while(boundingBoxGeoHashIterator.hasNext()){
    GeoHash geoHash = boudingBoxGeoHashIterator.next();
    set.add(geoHash);
  }
  return set;
}
```

## 3、经纬度点到线距离

​		整体思想就是根据传入的经纬度点和经纬度线构成一个三角形，根据角度信息，计算定点到底边的最短距离。

```java
/**
 * @descirption: 求经纬度点到经纬度线段最短距离
 * @param PAx 线段点经度
 * @param PAy 线段点纬度
 * @param PBx 线段点经度
 * @param PBy 线段点纬度
 * @param PCx 普通点经度
 * @param PCy 普通点纬度
 * @author: chengborong
 * @time 2021/09/02
 * */
public static double GetNearestDistance(double PAx, double PAy,double PBx, double PBy,double PCx, double PCy){
  double a,b,c;
  //求出三角形三条边的距离
  a = getDistanceBtwP(PAy,PAx,PBy,PBx);
  b = getDistanceBtwP(PBy,PBx,PCy,PCX);
  c = getDistanceBtwP(PAy,PAx,PCy,PCX);
 //根据顶点角的大小，判断最短距离
  if(b*b >= c*c + a*a) return c;
  if(c*c >= b*b + a*a) return b;
  double l = (a+b+c)/2;//周长的一半
  double s = Math.sqrt(l*(l-a)*(l-b)*(l-c));//海伦公式求面积
  return 2*s/a;
}


/**
*	根据传入的点计算两个点之间的距离
*/
public static double getDistanceBtwP(double LonA,double LatA,double LonB,double LatB){
  double radLng1 = LatA * Math.PI / 180.0;
  double radLng2 = LatB * Math.PI / 180.0;
  double a = radLng1 - radLng2;
  double b = (LonA - LonB) * Math.PI / 180.0;
  double s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a/2),2) + Math.cos(radLng1) * Math.cos(radLng2) * Math.pow(Math.sin(b/2),2)))*6378.137;
  return s;
}
```





