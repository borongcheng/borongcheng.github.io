+++
date = "2025-06-20T15:30:00"
title = "HashMap"
tags = ["JAVA","集合","源码阅读"]
categories = ["专业"]
+++
# 一、定义


# 二、源码阅读
### 入口
```java
package java.lang;


import java.util.HashMap;
import java.util.Hashtable;
import java.util.concurrent.ConcurrentHashMap;

public class Map {
    static HashMap<String, String> map = new HashMap<>();

    public static void main(String[] args) {
        map.put("1", "1");

        map.get("1");

        map.remove("1");
    }
}
```

### Map结构
```java
/**
 * HashMap是常用的Java集合之一，是基于哈希表的Map接口的实现。与HashTable主要区别为不支持同步和允许null作为key和value。
 * HashMap非线程安全，即任一时刻可以有多个线程同时写HashMap，可能会导致数据的不一致。
 * 如果需要满足线程安全，可以用 Collections的synchronizedMap方法使HashMap具有线程安全的能力，或者使用ConcurrentHashMap。
 * 在JDK1.6中，HashMap采用数组+链表实现，即使用链表处理冲突，同一hash值的链表都存储在一个链表里。
 * 但是当位于一个数组中的元素较多，即hash值相等的元素较多时，通过key值依次查找的效率较低。
 * 而JDK1.8中，HashMap采用数组+链表+红黑树实现，当链表长度超过阈值8时，将链表转换为红黑树，这样大大减少了查找时间。
 * 原本Map.Entry接口的实现类Entry改名为了Node。转化为红黑树时改用另一种实现TreeNode。
 */
public class HashMap<K, V> extends AbstractMap<K, V>
        implements Map<K, V>, Cloneable, Serializable {
/**
     * 默认的初始容量（容量为HashMap中槽的数目）是16，且实际容量必须是2的整数次幂。
     */
    static final int DEFAULT_INITIAL_CAPACITY = 1 << 4; // aka 16

    /**
     * 最大容量（必须是2的幂且小于2的30次方，传入容量过大将被这个值替换）
     */
    static final int MAXIMUM_CAPACITY = 1 << 30;

    /**
     * 默认装填因子0.75，如果当前键值对个数 >= HashMap最大容量*装填因子，进行rehash操作
     */
    static final float DEFAULT_LOAD_FACTOR = 0.75f;

    /**
     * JDK1.8 新加，Entry链表最大长度，当桶中节点数目大于该长度时，将链表转成红黑树存储；
     */
    static final int TREEIFY_THRESHOLD = 8;

    /**
     * JDK1.8 新加，当桶中节点数小于该长度，将红黑树转为链表存储；
     */
    static final int UNTREEIFY_THRESHOLD = 6;

    static class Node<K, V> implements Map.Entry<K, V> {
        // hash存储key的hashCode
        final int hash;
        // final:一个键值对的key不可改变
        final K key;
        V value;
        //指向下个节点的引用
        Node<K, V> next;

        //构造函数
        Node(int hash, K key, V value, Node<K, V> next) {
            this.hash = hash;
            this.key = key;
            this.value = value;
            this.next = next;
        }
    }

            /**
     * 哈希桶数组，分配的时候，table的长度总是2的幂
     */
    transient Node<K, V>[] table;

    /**
     * HashMap将数据转换成set的另一种存储形式，这个变量主要用于迭代功能
     */
    transient Set<Map.Entry<K, V>> entrySet;

    /**
     * 实际存储的数量，则HashMap的size()方法，实际返回的就是这个值，isEmpty()也是判断该值是否为0
     */
    transient int size;

    /**
     * hashmap结构被改变的次数，fail-fast机制
     */
    transient int modCount;

    /**
     * HashMap的扩容阈值，在HashMap中存储的Node键值对超过这个数量时，自动扩容容量为原来的二倍
     *
     * @serial
     */
    int threshold;

    /**
     * HashMap的负加载因子，可计算出当前table长度下的扩容阈值：threshold = loadFactor * table.length
     *
     * @serial
     */
    final float loadFactor;


} 
            
```

### put
+ 获取传入key的hashCode，根据hashCode进行高16位异或低16位，得到的结果和hashCode取模获取到hash值。
+ 判断当前hash表是否为空，如果为空则调用resize方法进行初始化。
+ 根据hash值mod 数组大小-1获取下标，如果当前下标无元素则直接插入。
+ 发生hash冲突进行分支判断
    - 判断该hash槽的首节点的key是否是当前插入key，是则记录当前节点。（多数情况下每个hash槽只会存在一个节点，通过这层判断提高效率）。
    - 当前hash槽节点是红黑树，如果是则进行红黑树插入，记录返回节点。
    - 当前hash槽节点是链表，遍历比较key，如果相同则记录，未有相同key节点则插入，插入后需要进行判断，是否需要链表转红黑树。
        * hash数组长度大于等于64且链表长度大于8时，链表转红黑树。
        * 链表长度大于8，hash数组长度小于64，触发数组扩容
+ 记录节点不为空，说明map中存在key对应的节点
    - onlyIfAbsent 为false或oldValue为null则可以对该节点值进行修改
    - afterNodeAccess：插入数据节点回调，默认为空。
    - 返回
+ 记录节点为空，说明这次是插入新节点。
    - size变更，计数+1
    - 判断是否需要扩容。
    - afterNodeInsertion：插入后回调，默认为空。
    - 返回。

```java
public V put(K key, V value) {
        return putVal(hash(key), key, value, false, true);
    }

/**
 * HashMap中键值对的存储形式为链表节点，hashCode相同的节点（位于同一个桶）用链表组织
 * hash方法分为三步:
 * 1.取key的hashCode
 * 2.key的hashCode高16位异或低16位
 * 3.将第一步和第二步得到的结果进行取模运算。
 */
static final int hash(Object key) {
    int h;
    //计算key的hashCode, h = Objects.hashCode(key)
    //h >>> 16表示对h无符号右移16位，高位补0，然后h与h >>> 16按位异或
    return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
}

final V putVal(int hash, K key, V value, boolean onlyIfAbsent,
                   boolean evict) {
        Node<K,V>[] tab; Node<K,V> p; int n, i;
        //如果hash表为空，通过resize方法进行初始化，使用n记录hash表长度
        if ((tab = table) == null || (n = tab.length) == 0)
            n = (tab = resize()).length;

        //hash值 mod (n - 1) 获取下标位置，如果无值则直接插入
        //(n - 1) & hash  等同于hash mod (n - 1)但是位运算更快
        if ((p = tab[i = (n - 1) & hash]) == null)
            tab[i] = newNode(hash, key, value, null);

        //发生hash冲突
        else {
            Node<K,V> e; K k;
            //比较第一个节点，如果key相同则记录当前节点
            //多数情况下每个hash槽只会存在一个节点，通过这层判断提升比较效率
            if (p.hash == hash &&
                ((k = p.key) == key || (key != null && key.equals(k))))
                e = p;
            //如果节点是红黑树，通过putTreeVal方法找到key对应节点或者插入一个新节点
            else if (p instanceof TreeNode)
                e = ((TreeNode<K,V>)p).putTreeVal(this, tab, hash, key, value);
            else {
                //如果当前hash槽位接入的是链表
                for (int binCount = 0; ; ++binCount) {
                    //遍历完都没找到key对应的节点则进行插入
                    //插入之后判断是否需要将链表转成红黑树
                    if ((e = p.next) == null) {
                        p.next = newNode(hash, key, value, null);
                        if (binCount >= TREEIFY_THRESHOLD - 1) // -1 for 1st
                            treeifyBin(tab, hash);
                        break;
                    }
                    //找到key对应的节点，记录该节点，跳出循环
                    if (e.hash == hash &&
                        ((k = e.key) == key || (key != null && key.equals(k))))
                        break;
                    p = e;
                }
            }
            //如果记录的节点不为空，说明key在map中存在旧值
            if (e != null) { // existing mapping for key
                V oldValue = e.value;
                //如果onlyIfAbsent为false或者旧值为null说明可以更新旧值
                if (!onlyIfAbsent || oldValue == null)
                    e.value = value;
                //当前方法为访问后回调，需要重写该方法。
                afterNodeAccess(e);
                return oldValue;
            }
        }、
    //map中不存在key对应节点，插入之后size++
        ++modCount;
    //根据size判断是否需要进行扩容
        if (++size > threshold)
            resize();
    //插入后回调，需要重写方法
        afterNodeInsertion(evict);
        return null;
    }
```

#### resize
+ 根据旧的容量和扩容阈值计算新的容量和扩容阈值
    - threshold = (int)(newCap * 0.75);
    - newCap = oldCap * 2;
    - loadFactor = 0.75 * cap。
+ 如果旧的Hash表不为空，则遍历hash槽进行节点迁移和reHash。
    - 如果槽位只存在一个节点，直接迁移。
    - 如果槽位的节点为红黑树，通过Node.split进行节点分离。
    - 如果操作节点为链表，将链表分为高低为两个链表，接入到新hash表中
        * hash & oldCap == 0 ：低位链表 ，newIndex = oldIndex;
        * hash & oldCap == 1 ：高位链表，newIndex = oldIndex + oldCap;

```java
/**
 * 最大容量（必须是2的幂且小于2的30次方，传入容量过大将被这个值替换）
 */
static final int MAXIMUM_CAPACITY = 1 << 30;

/**
 * 默认的初始容量（容量为HashMap中槽的数目）是16，且实际容量必须是2的整数次幂。
 */
static final int DEFAULT_INITIAL_CAPACITY = 1 << 4; 

/**
 * 默认装填因子0.75，如果当前键值对个数 >= HashMap最大容量*装填因子，进行rehash操作
 */
static final float DEFAULT_LOAD_FACTOR = 0.75f;

/**
 * HashMap的扩容阈值，在HashMap中存储的Node键值对超过这个数量时，自动扩容容量为原来的二倍
 *
 * @serial
 */
int threshold;

final Node<K,V>[] resize() {
    Node<K,V>[] oldTab = table;
    int oldCap = (oldTab == null) ? 0 : oldTab.length;
    int oldThr = threshold;
    int newCap, newThr = 0;
    //重新生成newThr 扩容阈值和newCap 容量，默认都是旧值*2
    if (oldCap > 0) {
        //如果旧容量大于等于最大容量限制
        if (oldCap >= MAXIMUM_CAPACITY) {
            //扩容阈值设置为整型最大值
            threshold = Integer.MAX_VALUE;
            //直接返回 无法进行再次扩容
            return oldTab;
        }
        else if ((newCap = oldCap << 1) < MAXIMUM_CAPACITY &&
                 oldCap >= DEFAULT_INITIAL_CAPACITY)
            //容量和扩容阈值都 * 2
            newThr = oldThr << 1; // double threshold
    }
    else if (oldThr > 0) // initial capacity was placed in threshold
        newCap = oldThr;
    else {               // zero initial threshold signifies using defaults
        newCap = DEFAULT_INITIAL_CAPACITY;
        newThr = (int)(DEFAULT_LOAD_FACTOR * DEFAULT_INITIAL_CAPACITY);
    }
    //重新计算新扩容阈值
    if (newThr == 0) {
        float ft = (float)newCap * loadFactor;
        newThr = (newCap < MAXIMUM_CAPACITY && ft < (float)MAXIMUM_CAPACITY ?
                  (int)ft : Integer.MAX_VALUE);
    }
    threshold = newThr;
    //创建新数组
    @SuppressWarnings({"rawtypes","unchecked"})
    Node<K,V>[] newTab = (Node<K,V>[])new Node[newCap];
    table = newTab;
    if (oldTab != null) {
        //遍历旧hash表中的桶，将数据转移到新表中
        for (int j = 0; j < oldCap; ++j) {
            Node<K,V> e;
            //该槽位不为空
            if ((e = oldTab[j]) != null) {
                oldTab[j] = null;
                //如果该槽位只有一个节点
                if (e.next == null)
                    //直接放入新表中
                    newTab[e.hash & (newCap - 1)] = e;
                    //如果节点为红黑树，则进行红黑树node分离
                else if (e instanceof TreeNode)
                    ((TreeNode<K,V>)e).split(this, newTab, j, oldCap);
                    //如果是链表，进行链表重排
                else { // preserve order
                    //扩容之后hash槽是原来的两倍，通过 hash & oldCap的形式讲原来一个槽位的链表分为两个
                    //低位链表 hash mod newCap < oldCap
                    //高位链表 hash mod newCap >= oldCap
                    //通过这种形式避免了hash的重计算
                    //低位链表
                    Node<K,V> loHead = null, loTail = null;
                    //高位链表
                    Node<K,V> hiHead = null, hiTail = null;
                    Node<K,V> next;
                    do {
                        next = e.next;
                        //如果hash & oldCap == 0 说明 e.hash mod newCap时与原来值一致
                        if ((e.hash & oldCap) == 0) {
                            if (loTail == null)
                                loHead = e;
                            else
                                loTail.next = e;
                            loTail = e;
                        }//hash & oldCap == 1 说明 e.hash mod newCap == oldIndex + cap
                        else {
                            if (hiTail == null)
                                hiHead = e;
                            else
                                hiTail.next = e;
                            hiTail = e;
                        }
                    } while ((e = next) != null);
                    //低位链表接入到新hash表中
                    if (loTail != null) {
                        loTail.next = null;
                        newTab[j] = loHead;
                    }
                    //高位链表接入hash表中
                    if (hiTail != null) {
                        hiTail.next = null;
                        newTab[j + oldCap] = hiHead;
                    }
                }
            }
        }
    }
    return newTab;
}
```

##### TreeNode.split
1、将红黑树根据高低为拆分成两个链表；

2、链表节点数量小于等于6时会将红黑树回退到链表结构。

```java
/**
         * 将结点太多的桶分割
         *
         * @param map   the map
         * @param tab   the table for recording bin heads
         * @param index the index of the table being split
         * @param bit   the bit of hash to split on
         */
        final void split(HashMap<K, V> map, Node<K, V>[] tab, int index, int bit) {
            TreeNode<K, V> b = this;
            // Relink into lo and hi lists, preserving order
            //低位链表
            TreeNode<K, V> loHead = null, loTail = null;
            //高位链表
            TreeNode<K, V> hiHead = null, hiTail = null;
            int lc = 0, hc = 0;
            //遍历红黑树的节点
            for (TreeNode<K, V> e = b, next; e != null; e = next) {
                next = (TreeNode<K, V>) e.next;
                e.next = null;
                //和链表相同根据 hash & oldCap 的值进行高低位分表
                if ((e.hash & bit) == 0) {
                    if ((e.prev = loTail) == null)
                        loHead = e;
                    else
                        loTail.next = e;
                    loTail = e;
                    ++lc;
                } else {
                    if ((e.prev = hiTail) == null)
                        hiHead = e;
                    else
                        hiTail.next = e;
                    hiTail = e;
                    ++hc;
                }
            }
            //低位链表处理
            if (loHead != null) {
                //判断是否需要红黑树转链表 不转红黑树直接接入接入到新hash表中
                if (lc <= UNTREEIFY_THRESHOLD)
                    tab[index] = loHead.untreeify(map);
                else {
                    //转红黑树再接入到新hash表中
                    tab[index] = loHead;
                    if (hiHead != null) // (else is already treeified)
                        loHead.treeify(tab);
                }
            }
            //高位链表处理
            if (hiHead != null) {
                //不转红黑树，下标 + oldCap 接入新hash表
                if (hc <= UNTREEIFY_THRESHOLD)
                    tab[index + bit] = hiHead.untreeify(map);
                else {
                    tab[index + bit] = hiHead;
                    if (loHead != null)
                        //接入新hash表之后转红黑树
                        hiHead.treeify(tab);
                }
            }
        }
```



### get
+ 根据key计算hash值
+ 如果当前hash表为空，或者通过hash值计算出来下标在hash表中槽位空直接返回。
+ 比较该hash槽首节点与当前key是否相同，相同直接返回。
+ 判断节点是否为红黑树，是则通过红黑树getTreeNode查找。
+ 节点为链表，遍历查找。

```java
public V get(Object key) {
    Node<K,V> e;
    //计算hash值，获取hash对应位置的key
    return (e = getNode(hash(key), key)) == null ? null : e.value;
}

final Node<K,V> getNode(int hash, Object key) {
    Node<K,V>[] tab; Node<K,V> first, e; int n; K k;
    //当前hash表不为空，且通过hash值计算出来的hash槽位置不为空。
    if ((tab = table) != null && (n = tab.length) > 0 &&
        (first = tab[(n - 1) & hash]) != null) {
        
        //比较hash槽首位元素的key判断是否位指定元素。
        if (first.hash == hash && 
            ((k = first.key) == key || (key != null && key.equals(k))))
            return first;
        //获取下一个节点，判断是否为红黑树，如果是则通过红黑树方式检索数据
        if ((e = first.next) != null) {
            if (first instanceof TreeNode)
                return ((TreeNode<K,V>)first).getTreeNode(hash, key);
            //如果是链表，则遍历查找
            do {
                if (e.hash == hash &&
                    ((k = e.key) == key || (key != null && key.equals(k))))
                    return e;
            } while ((e = e.next) != null);
        }
    }
    //未匹配到key对应的node
    return null;
}
```



### remove
1、判断hash表不为空，且该hash槽不为空。

2、比较首节点，如果key相同，记录节点。

3、红黑树 or 链表，查找对应key记录。

4、移除节点。

```java
public V remove(Object key) {
        Node<K,V> e;
    return (e = removeNode(hash(key), key, null, false, true)) == null ?
        null : e.value;
}

final Node<K,V> removeNode(int hash, Object key, Object value,
                               boolean matchValue, boolean movable) {
    Node<K,V>[] tab; Node<K,V> p; int n, index;
    //判断hash表不为空，且该hash槽不为空
    if ((tab = table) != null && (n = tab.length) > 0 &&
        (p = tab[index = (n - 1) & hash]) != null) {
        Node<K,V> node = null, e; K k; V v;
        //首节点比较key值，如果相等记录该节点
        if (p.hash == hash &&
            ((k = p.key) == key || (key != null && key.equals(k))))
            node = p;
        else if ((e = p.next) != null) {
            //如果是红黑树节点
            if (p instanceof TreeNode)
                //查找并记录
                node = ((TreeNode<K,V>)p).getTreeNode(hash, key);
            else {
                //如果是链表节点，查找并记录
                do {
                    if (e.hash == hash &&
                        ((k = e.key) == key ||
                         (key != null && key.equals(k)))) {
                        node = e;
                        break;
                    }
                    p = e;
                } while ((e = e.next) != null);
            }
        }
        if (node != null && (!matchValue || (v = node.value) == value ||
                             (value != null && value.equals(v)))) {
            if (node instanceof TreeNode)
                //红黑树，调用方法移除节点
                ((TreeNode<K,V>)node).removeTreeNode(this, tab, movable);
            else if (node == p)
                tab[index] = node.next;
            else
                p.next = node.next;
            ++modCount;
            --size;
            afterNodeRemoval(node);
            return node;
        }
    }
    return null;
}
```

