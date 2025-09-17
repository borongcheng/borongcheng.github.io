+++
date = "2025-06-28T11:52:00"
title = "ConCurrentHashMap"
tags = ["JAVA","集合","源码阅读"]
+++
# 一、定义


# 二、源码解读
## 入口


## 结构


## get
+ 根据hash值计算下标，拿到下标位置首节点。
+ 根据首节点hash值判断是否为树节点，是则通过红黑树查找返回。
+ 不是则遍历链表查找返回。

```java
public V get(Object key) {
    Node<K,V>[] tab; Node<K,V> e, p; int n, eh; K ek;
    //计算hash值
    int h = spread(key.hashCode());
    //table不为空，根据hash计算出索引，拿到该节点数据
    if ((tab = table) != null && (n = tab.length) > 0 &&
        (e = tabAt(tab, (n - 1) & h)) != null) {
        //判断首节点key是否符合预期，返回
        if ((eh = e.hash) == h) {
            if ((ek = e.key) == key || (ek != null && key.equals(ek)))
                return e.val;
        }
        else if (eh < 0)//该节点hash值小于0，说明首节点时treeBin节点
            //通过红黑树查找key并返回
            return (p = e.find(h, key)) != null ? p.val : null;
        //否则遍历链表查找
        while ((e = e.next) != null) {
            if (e.hash == h &&
                ((ek = e.key) == key || (ek != null && key.equals(ek))))
                return e.val;
        }
    }
    return null;
}
```

## put
+ 根据key的hash值再次进行hash散列处理
+ 通过binCount记录hash槽下挂节点数量：0 = 未加入新节点，2 = treeBin或链表节点数量，其他链表节点树；
+ 通过死循环break跳出的方式进行插入值。
    - 分支一：如果hash表未初始化，则先初始化。
    - 分支二：根据hash值计算下标，未发生hash冲突，直接通过cas的形式插入新node，跳出循环。
    - 分支三：根据首节点的Hash值判断，Hash == -1,检测到正在扩容，协助扩容，进入下一次循环。
    - 分支四：节点正常且发生Hash冲突。对首节点进行sychronized加锁。
        * 节点后挂链表：遍历查找key，存在则替换，不存在则添加，binCount变化，跳出循环。
        * 节点后挂红黑树：binCount == 2，红黑树插入值，跳出循环。
+ binCount >= 8,链表转红黑树。
+ 根据binCount判断map是否需要扩容

```java
public V put(K key, V value) {
    return putVal(key, value, false);
}

final V putVal(K key, V value, boolean onlyIfAbsent) {
    if (key == null || value == null) throw new NullPointerException();
    int hash = spread(key.hashCode());//将key的hashCode再次进行hash
    int binCount = 0;//记录hash槽下挂节点数量，用于链表转红黑树
    for (Node<K,V>[] tab = table;;) {//CAS经典写法，不成功一致重试
        Node<K,V> f; int n, i, fh;
        //table未初始化，先进行初始化
        if (tab == null || (n = tab.length) == 0)
            tab = initTable();
        else if ((f = tabAt(tab, i = (n - 1) & hash)) == null) {
            //根据hash值计算下标，未发生hash冲突，通过CAS形式将Node节点插入。
            if (casTabAt(tab, i, null,
                         new Node<K,V>(hash, key, value, null)))
                break;                   // no lock when adding to empty bin
        }
        else if ((fh = f.hash) == MOVED)//hash槽位首节点的hash值判断是否在进行扩容，是则协助扩容，下次循环再进行put
            tab = helpTransfer(tab, f);
        else {//发生hash冲突时
            V oldVal = null;
            synchronized (f) {//仅对首节点进行加锁，减少锁粒度
                if (tabAt(tab, i) == f) {
                    //再次判断首节点 状态正常，且不为tree节点
                    if (fh >= 0) {
                        binCount = 1;
                        //通过首节点进行遍历
                        for (Node<K,V> e = f;; ++binCount) {
                            K ek;
                            //如果找到key对应的节点则根据判断进行数据更替
                            if (e.hash == hash &&
                                ((ek = e.key) == key ||
                                 (ek != null && key.equals(ek)))) {
                                oldVal = e.val;
                                if (!onlyIfAbsent)
                                    e.val = value;
                                break;//跳出循环
                            }
                            Node<K,V> pred = e;
                            //无key对应节点，创建新节点接入到链表尾部
                            if ((e = e.next) == null) {
                                pred.next = new Node<K,V>(hash, key,
                                                          value, null);
                                break;
                            }
                        }
                    }//如果是红黑树
                    else if (f instanceof TreeBin) {
                        Node<K,V> p;
                        binCount = 2;//标识当前已经是红黑树了，数据结构无需变动
                        //调用红黑树的方法进行值插入
                        if ((p = ((TreeBin<K,V>)f).putTreeVal(hash, key,
                                                       value)) != null) {
                            oldVal = p.val;
                            if (!onlyIfAbsent)
                                p.val = value;
                        }
                    }
                }
            }
            if (binCount != 0) {
                //根据binCount判断是否需要进行链表转红黑树
                if (binCount >= TREEIFY_THRESHOLD)
                    treeifyBin(tab, i); //若length<64,直接tryPresize,两倍table.length;不转红黑树
                if (oldVal != null)
                    //返回旧值
                    return oldVal;
                break;
            }
        }
    }
    //判断是否需要进行map扩容
    addCount(1L, binCount);
    return null;
}
```

### initTable
+ 设置CAS循环，如果hash表为空则一直循环；
+ 进行分支判断初始化表；
    - 分支一：sizeCtl < 0表示当前容器正在初始化或者扩容，让出CPU等待进入下个循环再次判定。
    - 分支二：通过CAS的设置sizeCtl为-1，抢占初始化权；
        * 双重检查，防止容易被初始化完毕。
        * 确定容器容量，初始化容器，计算阈值；
    - 将sizeCtl更新为计算出来的扩容阈值。

```java
//负数表示正在扩容或者初始化操作，-1表示正在初始化，-N表示有N - 1个线程参与扩容。
// sizeCtl = 0：默认初始值，表示未初始化。
// sizeCtl > 0: 若表未初始化表示表的容量，初始化了表示扩容阈值
private transient volatile int sizeCtl;
private final Node<K, V>[] initTable() {
    Node<K, V>[] tab;
    int sc;
    //确认hash表是否是空的
    while ((tab = table) == null || tab.length == 0) {
        //如果当前正在扩容或者初始化，线程让出CPU
        if ((sc = sizeCtl) < 0)
            Thread.yield(); // lost initialization race; just spin
            //通过CAS将sizeCtl设置为-1，抢占初始化权
        else if (U.compareAndSwapInt(this, SIZECTL, sc, -1)) {
            try {
                //双重检查，防止其他线程已经初始化
                if ((tab = table) == null || tab.length == 0) {
                    //确定容器的初始容量
                    int n = (sc > 0) ? sc : DEFAULT_CAPACITY;
                    @SuppressWarnings("unchecked")
                    Node<K, V>[] nt = (Node<K, V>[]) new Node<?, ?>[n];
                    table = tab = nt;
                    //计算阈值 n * 0.75
                    sc = n - (n >>> 2);
                }
            } finally {
                //更新sizeCtl 为阈值
                sizeCtl = sc;
            }
            break;
        }
    }
    return tab;
}
```

### 扩容
ConcurrentHashMap扩容的三个时机：

+ 当前hash表长度小于64，且有链表长度大于8时，会在treeifyBin方法中判断调用tryPresize进行数组扩容；
+ 添加元素时，会调用addCount方法，里面判断元素个数是否达到扩容阈值，进行调用transfer方法进行扩容；
+ 添加元素时，如果对应hash槽的节点为forwardNode，即node.hash == -1说明当前节点正在扩容，且已经被转移到新的hash表中，则调用helpTransfer方法协助扩容。



#### tryPresize
+ 当前hash表长度大于64，sychronized锁住首节点，将链表转换成红黑树，更改首节点为TreeBin节点。
+ hash表长度小于64，调用tryPresize方法进行hash表扩容。
    - 计算目标容量。
    - 开启CAS循环。
        * 分支一：当前表未初始化，CAS获取初始化权初始化；
        * 分支二：达到目标容量或者最大容量，跳出循环；
        * 分支三：正常扩容
            + 根据hash表容量计算扩容戳；
            + 根据sc判断是否首次扩容；
                - 非首次扩容
                    * 通过扩容戳区分不匹配或判断协助线程数达到最大，跳出循环；
                    * CAS更改sc数量+1，调用transfer
                - 首次扩容
                    * transfer

```java
private final void treeifyBin(Node<K, V>[] tab, int index) {
    Node<K, V> b;
    int n, sc;
    if (tab != null) {
        //如果当前hash表长度小于64
        if ((n = tab.length) < MIN_TREEIFY_CAPACITY)
            //进行扩容，扩容到原来两倍
            tryPresize(n << 1);
            //首节点大于0，说明还是链表
        else if ((b = tabAt(tab, index)) != null && b.hash >= 0) {
            //锁住首节点
            synchronized (b) {
                if (tabAt(tab, index) == b) {
                    TreeNode<K, V> hd = null, tl = null;
                    //将链表转换成红黑树
                    for (Node<K, V> e = b; e != null; e = e.next) {
                        TreeNode<K, V> p =
                                new TreeNode<K, V>(e.hash, e.key, e.val,
                                        null, null);
                        if ((p.prev = tl) == null)
                            hd = p;
                        else
                            tl.next = p;
                        tl = p;
                    }
                    //将头节点更改为TreeBin节点，该节点hash值为-2
                    setTabAt(tab, index, new TreeBin<K, V>(hd));
                }
            }
        }
    }
}

private final void tryPresize(int size) {
    //计算目标容量 
    int c = (size >= (MAXIMUM_CAPACITY >>> 1)) ? MAXIMUM_CAPACITY :
            tableSizeFor(size + (size >>> 1) + 1);
    //size + (size >>> 1) + 1 === size + (size * 0.5) + 1 === 1.5*size + 1 为扩容阈值 
    int sc;
    //CAS循环
    while ((sc = sizeCtl) >= 0) {
        Node<K, V>[] tab = table;
        int n;
        //如果当前hash表未初始化
        if (tab == null || (n = tab.length) == 0) {
            n = (sc > c) ? sc : c;
            //CAS抢占初始化权
            if (U.compareAndSwapInt(this, SIZECTL, sc, -1)) {
                //初始化
                try {
                    if (table == tab) {
                        @SuppressWarnings("unchecked")
                        Node<K, V>[] nt = (Node<K, V>[]) new Node<?, ?>[n];
                        table = nt;
                        sc = n - (n >>> 2);
                    }
                } finally {
                    sizeCtl = sc;
                }
            }
            //如果已达到扩容目标或者到达最大容量，跳出循环
        } else if (c <= sc || n >= MAXIMUM_CAPACITY)
            break;
            //正常扩容流程，确认当前表是主表
        else if (tab == table) {
            //扩容戳，通过hash表容量计算，用于区分扩容线程是否是同一批
            int rs = resizeStamp(n);
            //sc < 0表示当前有线程正在扩容
            if (sc < 0) {
                Node<K, V>[] nt;
                //判断rs扩容戳是否匹配
                //判断协助线程数是否达到最大
                //扩容临时表为空时
                if ((sc >>> RESIZE_STAMP_SHIFT) != rs || sc == rs + 1 ||
                        sc == rs + MAX_RESIZERS || (nt = nextTable) == null ||
                        transferIndex <= 0)
                    break;
                //CAS增加扩容线程数量
                if (U.compareAndSwapInt(this, SIZECTL, sc, sc + 1))
                    //调用扩容方法协助扩容
                    transfer(tab, nt);

            } else if (U.compareAndSwapInt(this, SIZECTL, sc,
                    (rs << RESIZE_STAMP_SHIFT) + 2))// 当前线程为首次扩容线程
                //调用方法开始扩容
                transfer(tab, null);
        }
    }
}
```

#### helpTransfer
+ hash表已初始化，当前节点为ForwardingNode，且扩容的临时表不为空；（ForwardingNode节点表示当前节点数据已经迁移到了扩容临时表中）。
+ CAS循环
    - 分支一：获取扩容戳判断是否可以协助；
    - 分支二：cas sc增加协助线程数量，协助扩容。

```java
final Node<K, V>[] helpTransfer(Node<K, V>[] tab, Node<K, V> f) {
    Node<K, V>[] nextTab;
    int sc;
    //hash表已经初始化，且当前节点为ForwardingNode节点，同时扩容临时表不为空
    if (tab != null && (f instanceof ForwardingNode) &&
            (nextTab = ((ForwardingNode<K, V>) f).nextTable) != null) {
        //获取扩容戳
        int rs = resizeStamp(tab.length);
        //增加CAS循环
        while (nextTab == nextTable && table == tab &&
                (sc = sizeCtl) < 0) {
            //根据扩容戳判断是否可以协助
            if ((sc >>> RESIZE_STAMP_SHIFT) != rs || sc == rs + 1 ||
                    sc == rs + MAX_RESIZERS || transferIndex <= 0)
                break;
            //cas修改sc次数，记录协助线程数量
            if (U.compareAndSwapInt(this, SIZECTL, sc, sc + 1)) {
                //协助扩容
                transfer(tab, nextTab);
                break;
            }
        }
        return nextTab;
    }
    return table;
}
```

#### transfer
+ 根据CPU数量计算每个线程处理的区间，每个线程最少处理16个桶，如果达到16个则不再进行分配；
+ 首个线程扩容是需要创建nextTable；
+ 划分好区间之后，迁移索引从高位开始，目的是扩容时增改数据修改的hash槽位是地位，降低并发冲突。
+ 协助线程通过CAS进行区间再次分配；
+ 根据索引下标判断是否扩容完成，通过CAS更改sizeCtl计数，如果是最后一个线程则将sizeCtl更改为下次扩容阈值。
+ 正常扩容：
    - sychronized锁住首节点
    - 根据节点hash判断是链表还是红黑树，根据hash值计算出高位掩码，根据高位掩码将节点分为高位链表和地位链表，在进行红黑树分链表分时候需要根据长度判断是否需要将红黑树转换成链表（长度小于6时）。

```java
private final void transfer(Node<K, V>[] tab, Node<K, V>[] nextTab) {
        int n = tab.length, stride;
        //计算每个线程处理桶的数量
        if ((stride = (NCPU > 1) ? (n >>> 3) / NCPU : n) < MIN_TRANSFER_STRIDE)
            stride = MIN_TRANSFER_STRIDE; // 每个线程最少处理16个桶
        if (nextTab == null) {            // 第一个扩容的线程
            try {
                @SuppressWarnings("unchecked")
                Node<K, V>[] nt = (Node<K, V>[]) new Node<?, ?>[n << 1];
                nextTab = nt;//常见nextTable
            } catch (Throwable ex) {      // try to cope with OOME
                sizeCtl = Integer.MAX_VALUE;
                return;
            }
            nextTable = nextTab;
            transferIndex = n; //迁移索引从高位开始：扩容时插入数据会在地位插入，高位开始扩容降低冲突
        }
        int nextn = nextTab.length;
        //占位节点，标记已经迁移完了的hash槽
        ForwardingNode<K, V> fwd = new ForwardingNode<K, V>(nextTab);
        //控制迁移进度
        boolean advance = true;
        //控制扩容完成进度
        boolean finishing = false; // to ensure sweep before committing nextTab
        //迁移循环，i 表示当前处理桶下标，bound表示当前线程处理桶的下限
        for (int i = 0, bound = 0; ; ) {
            Node<K, V> f;
            int fh;
            //确定当前线程处理的区间
            while (advance) {
                int nextIndex, nextBound;
                //处理完成或者分配完，跳出循环
                if (--i >= bound || finishing)
                    advance = false;
                    //所有区间分配完成，线程最小处理区间16，分配完成后不再分配
                else if ((nextIndex = transferIndex) <= 0) {
                    i = -1;
                    advance = false;
                    //CAS分配区间
                } else if (U.compareAndSwapInt
                        (this, TRANSFERINDEX, nextIndex,
                                nextBound = (nextIndex > stride ?
                                        nextIndex - stride : 0))) {
                    bound = nextBound;// 当前线程处理区间[bound, nextIndex)
                    i = nextIndex - 1;// 从高位开始处理
                    advance = false;
                }
            }
            //判断是否处理完成
            if (i < 0 || i >= n || i + n >= nextn) {
                int sc;
                //扩容完毕
                if (finishing) {
                    nextTable = null;
                    table = nextTab;
                    sizeCtl = (n << 1) - (n >>> 1);//记录下次扩容的阈值
                    return;
                }
                //CAS去减少扩容的线程数量
                if (U.compareAndSwapInt(this, SIZECTL, sc = sizeCtl, sc - 1)) {
                    if ((sc - 2) != resizeStamp(n) << RESIZE_STAMP_SHIFT)
                        return;
                    //如果是最后一个线程，更改finishing状态
                    finishing = advance = true;
                    i = n; // recheck before commit
                }
                //如果是空桶，fwd节点占位
            } else if ((f = tabAt(tab, i)) == null)
                advance = casTabAt(tab, i, null, fwd);
                //迁移完成判断
            else if ((fh = f.hash) == MOVED)
                advance = true; // already processed
            else {
                //锁住首节点开始进行迁移
                synchronized (f) {
                    //双重检查防止并发修改
                    if (tabAt(tab, i) == f) {
                        Node<K, V> ln, hn;
                        //当前节点为链表
                        if (fh >= 0) {
                            int runBit = fh & n; // 计算高位掩码
                            Node<K, V> lastRun = f;
                            //区分高低位链表 接入不同hash槽位
                            for (Node<K, V> p = f.next; p != null; p = p.next) {
                                int b = p.hash & n;
                                if (b != runBit) {
                                    runBit = b;
                                    lastRun = p;
                                }
                            }
                            if (runBit == 0) {
                                ln = lastRun;
                                hn = null;
                            } else {
                                hn = lastRun;
                                ln = null;
                            }
                            for (Node<K, V> p = f; p != lastRun; p = p.next) {
                                int ph = p.hash;
                                K pk = p.key;
                                V pv = p.val;
                                if ((ph & n) == 0)
                                    ln = new Node<K, V>(ph, pk, pv, ln);
                                else
                                    hn = new Node<K, V>(ph, pk, pv, hn);
                            }
                            setTabAt(nextTab, i, ln);
                            setTabAt(nextTab, i + n, hn);
                            setTabAt(tab, i, fwd);
                            advance = true;
                        } else if (f instanceof TreeBin) {
                            //同链表逻辑，区分高地位红黑树，接入不同hash槽
                            //根据大小判断是否红黑树转链表
                            TreeBin<K, V> t = (TreeBin<K, V>) f;
                            TreeNode<K, V> lo = null, loTail = null;
                            TreeNode<K, V> hi = null, hiTail = null;
                            int lc = 0, hc = 0;
                            for (Node<K, V> e = t.first; e != null; e = e.next) {
                                int h = e.hash;
                                TreeNode<K, V> p = new TreeNode<K, V>
                                        (h, e.key, e.val, null, null);
                                if ((h & n) == 0) {
                                    if ((p.prev = loTail) == null)
                                        lo = p;
                                    else
                                        loTail.next = p;
                                    loTail = p;
                                    ++lc;
                                } else {
                                    if ((p.prev = hiTail) == null)
                                        hi = p;
                                    else
                                        hiTail.next = p;
                                    hiTail = p;
                                    ++hc;
                                }
                            }
                            ln = (lc <= UNTREEIFY_THRESHOLD) ? untreeify(lo) :
                                    (hc != 0) ? new TreeBin<K, V>(lo) : t;
                            hn = (hc <= UNTREEIFY_THRESHOLD) ? untreeify(hi) :
                                    (lc != 0) ? new TreeBin<K, V>(hi) : t;
                            setTabAt(nextTab, i, ln);
                            setTabAt(nextTab, i + n, hn);
                            setTabAt(tab, i, fwd);
                            advance = true;
                        }
                    }
                }
            }
        }
    }
```

## remove
