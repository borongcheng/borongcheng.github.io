+++
date = "2024-08-28T11:52:54"
title = "Spring MVC"
tags = ["JAVA","Spring"]
categories = ["专业"]
+++
# 一、定义
1、什么是spring mvc？
spring mvc是一种web层的mvc框架，用于替代servlet（处理 || 响应请求）；
spring mvc是spring体系中的一员，提供mode-view-controller架构和随时可用的组件，用于开发灵活且松散耦合的web应用程序。

2、spring mvc有什么优点？

- 模块化
   - 是spring框架的一部分，可以与其他spring模块无缝集成。
- 方便
   - 添加请求映射方法还是不同数据格式的响应
- 拦截器
   - 提供拦截器机制，方便对请求进行统一拦截处理。
- 异常机制
   - 可以对异常进行统一处理。
- 视图技术
   - 不局限于JSP，Freemarker、Thymeleaf等

3、spring mvc的核心组件有哪些？

- DispatchServlet
   - spring mvc的核心控制器，负责拦截请求并分发给相应的处理器(Controller)进行处理。
   - 它是整个mvc框架的入口点，负责处理请求、调用适当的处理器以及管理处理器返回的视图。
- HandlerMapping
   - 请求的处理器匹配器，定义了请求到处理器的映射关系
   - 在DispatcherServlet接收到请求后，通过HandlerMapping定位并选择合适的处理器来处理请求。
- HandlerAdapter
   - 处理器适配器，负责执行处理器的方法，并将处理器方法的返回值转换成一个ModeAndView对象。
- MutipartResolver
   - 处理文件上传接口，解析请求头Content-Type为mutipart/*的请求里面的文件数据。
- HandlerInterceptor
   - 拦截器接口，允许开发者在请求处理的不同阶段（请求前、请求后、视图渲染前后）对请求进行预处理和后处理。
- HandlerExceptionResolver
   - 全局异常处理策略，允许开发者对异常进行统一处理。
- ViewResolver
   - 视图解析器，解析视图名到实际视图对象的策略。
- LocaleResolver和ThemeResolver
   - 分别用于处理国际化解析和主题解析

spring mvc 对各个组件的职责划分比较清晰，DispatchServlet负责协调，其他组件各自处理互补干扰。

4、spring mvc中的WebApplicationContext是什么？
是一种特殊的ApplicationContext，主要用于web应用程序上下文的管理。
它允许从web根目录的路径中加载配置文件，完成初始化spring mvc组件的工作。
从WebApplicationContext中，可以获取到ServletContext引用，整个Web应用上下文将作为属性放置在ServletContext中，以便Web应用可以访问Spring上下文。

5、什么是spring mvc的拦截器？
在spring mvc中，拦截器是一种能够在请求被处理前后、视图渲染前后执行特定任务的组件。它可以让开发者在请求处理的不同阶段插入自定义的逻辑。
例如：日志记录、权限检查、国际化等。
拦截器与过滤器类似，但拦截器更加专注于控制器方法的前后处理和视图渲染的干预。
通过实现HandlerInterceptor接口来自定义拦截器，该接口定义了三个主要方法：

- preHandler
   - 在请求处理前调用，返回true则继续处理，返回false则中断后续的执行。
- postHandler
   - 在请求处理之后、视图渲染之前调用，允许修改ModelAndView
- afterCompletion
   - 在请求处理完成之后调用，允许进行一些资源清理的操作。

可以通过拦截器进行权限校验，参数校验，日志记录等

6、spring mvc 的拦截器和Filter过滤器有什么差别？
过滤器和拦截器在spring mvc作用类似，通常来说，过滤器更适合处理请求的通用任务和全局性处理，拦截器更适合于业务逻辑相关的控制和处理。

- 执行时机和作用范围
   - Filter
      - 运行在Servlet容器级别，可以对所有请求进行拦截。
      - 在请求进入Servlet前，以及相应返回客户端前执行。
      - 场景例如编码转换，身份验证，日志记录等。
   - Interceptor
      - 在spring mvc控制器级别，只对DispatcherServlet管理的请求有效。
      - 在请求进入Controller之前、进入视图之前、视图渲染完成之后三个节点执行。
      - 主要用于处理与业务逻辑更相关的功能，例如权限检查、视图渲染前的数据预处理等。

**SpringMVC运行**
![image.png](https://cdn.nlark.com/yuque/0/2024/png/22648511/1720176272749-275fbce6-6324-4598-ba69-cfd53d4f49a7.png#averageHue=%23f8f7f2&clientId=u38dd8d9d-a955-4&from=paste&id=ud7341dbe&originHeight=896&originWidth=1150&originalType=url&ratio=1&rotation=0&showTitle=false&size=655543&status=done&style=none&taskId=u4c5ed750-09ea-40b6-8cbf-2815a9d0ee2&title=)
**代码序列图**
![image.png](https://cdn.nlark.com/yuque/0/2024/png/22648511/1720176294285-284e8935-8c8c-4b6d-b935-970afbea7e5d.png#averageHue=%23f3f3f3&clientId=u38dd8d9d-a955-4&from=paste&id=u7a4065dc&originHeight=447&originWidth=664&originalType=url&ratio=1&rotation=0&showTitle=false&size=110832&status=done&style=none&taskId=ud12b4932-71ba-4d8b-a60e-54f17b2dea4&title=)
**流程示意图**
![image.png](https://cdn.nlark.com/yuque/0/2024/png/22648511/1720176321871-38a14cb2-45c9-49f6-97a1-416964cfd3e2.png#averageHue=%23f7f7f7&clientId=u38dd8d9d-a955-4&from=paste&id=udaa067a7&originHeight=1759&originWidth=1475&originalType=url&ratio=1&rotation=0&showTitle=false&size=768688&status=done&style=none&taskId=udfdcf516-7619-4c42-88fa-5e9ceec763b&title=)
# 二、源码分析
## 1、WebMvcAutoConfiguration
> webMvcAutoConfiguration是Spring Boot中的一个自动配置类，它主要负责Spring MVC 的相关功能和特性，以便于快速启动和运行基于Spring MVC的Web应用程序。
> 主要工作有一下几点：
> - 配置DispatcherServlet
>    - 自动配置DispatcherServlet并映射它的URL路径（默认为/），这是Spring MVC中负责请求分发的核心组件。
> - 配置HandlerMapping
>    - 配置请求到处理程序的映射，决定那个Controller处理请求。
> - 配置HandlerAdapter
>    - 配置处理程序适配器，使得Spring能够调用Controller中的方法来处理请求。
> - 配置ViewResolver
>    - 配置视图解析器，将逻辑视图名解析为实际视图。
> - 配置静态资源处理
>    - 自动配置Spring MVC 如何处理静态资源，包括默认的处理路径和缓存策略。
> - 配置消息转换器
>    - 配置HTTP消息转换器，用于将请求和响应和Java对象互相转换。
> - 配置其他Web相关特性
>    - 例如编码设置、跨域请求处理、错误页面展示等。

```java
@ConditionalOnWebApplication(type = Type.SERVLET)
@ConditionalOnClass({ Servlet.class, DispatcherServlet.class, WebMvcConfigurer.class })
@ConditionalOnMissingBean(WebMvcConfigurationSupport.class)
@AutoConfigureOrder(Ordered.HIGHEST_PRECEDENCE + 10)
//dispatcherServlet自动配置类
@AutoConfigureAfter({ DispatcherServletAutoConfiguration.class,
		ValidationAutoConfiguration.class })
public class WebMvcAutoConfiguration {

	public static final String DEFAULT_PREFIX = "";

	public static final String DEFAULT_SUFFIX = "";

	private static final String[] SERVLET_LOCATIONS = { "/" };
}
```
### 1、DispatcherServletAutoConfiguration
> springboot中的自动装配类之一，专门负责配置和初始化DisptacherServlet，它是spring mvc中用于接收Http请求并分发给相应处理器的核心组件。

```java
@AutoConfigureOrder(Ordered.HIGHEST_PRECEDENCE)
@Configuration
@ConditionalOnWebApplication(type = Type.SERVLET)
@ConditionalOnClass(DispatcherServlet.class)
@AutoConfigureAfter(ServletWebServerFactoryAutoConfiguration.class)
@EnableConfigurationProperties(ServerProperties.class)
public class DispatcherServletAutoConfiguration {
    /*
	 * The bean name for a DispatcherServlet that will be mapped to the root URL "/"
	 */
	public static final String DEFAULT_DISPATCHER_SERVLET_BEAN_NAME = "dispatcherServlet";

	/*
	 * The bean name for a ServletRegistrationBean for the DispatcherServlet "/"
	 */
	public static final String DEFAULT_DISPATCHER_SERVLET_REGISTRATION_BEAN_NAME = "dispatcherServletRegistration";
    @Configuration
	@Conditional(DefaultDispatcherServletCondition.class)
	@ConditionalOnClass(ServletRegistration.class)
	@EnableConfigurationProperties(WebMvcProperties.class)
	protected static class DispatcherServletConfiguration {

		private final WebMvcProperties webMvcProperties;

		public DispatcherServletConfiguration(WebMvcProperties webMvcProperties) {
			this.webMvcProperties = webMvcProperties;
		}
        //配置disptacherServlet
		@Bean(name = DEFAULT_DISPATCHER_SERVLET_BEAN_NAME)
		public DispatcherServlet dispatcherServlet() {
			DispatcherServlet dispatcherServlet = new DispatcherServlet();
			dispatcherServlet.setDispatchOptionsRequest(
					this.webMvcProperties.isDispatchOptionsRequest());
			dispatcherServlet.setDispatchTraceRequest(
					this.webMvcProperties.isDispatchTraceRequest());
			dispatcherServlet.setThrowExceptionIfNoHandlerFound(
					this.webMvcProperties.isThrowExceptionIfNoHandlerFound());
			return dispatcherServlet;
		}

		@Bean
		@ConditionalOnBean(MultipartResolver.class)
		@ConditionalOnMissingBean(name = DispatcherServlet.MULTIPART_RESOLVER_BEAN_NAME)
		public MultipartResolver multipartResolver(MultipartResolver resolver) {
			// Detect if the user has created a MultipartResolver but named it incorrectly
			return resolver;
		}

	}
}
```
##### 1、dispatcherServletInit
> disptacherServlet是一个实现了Servlet接口的类，Servlet的初始化阶段会调用它的init方法，而DisptacherServlet的方法是继承自父类HttpServletBean的。

```java
public final void init() throws ServletException {
		if (logger.isDebugEnabled()) {
			logger.debug("Initializing servlet '" + getServletName() + "'");
		}
  		//处理init-param参数，但是SpringBoot中默认是没有的
		PropertyValues pvs = new ServletConfigPropertyValues(getServletConfig(), this.requiredProperties);
		if (!pvs.isEmpty()) {
			try {
				BeanWrapper bw = PropertyAccessorFactory.forBeanPropertyAccess(this);
				ResourceLoader resourceLoader = new ServletContextResourceLoader(getServletContext());
				bw.registerCustomEditor(Resource.class, new ResourceEditor(resourceLoader, getEnvironment()));
				initBeanWrapper(bw);
				bw.setPropertyValues(pvs, true);
			}
			catch (BeansException ex) {
				if (logger.isErrorEnabled()) {
					logger.error("Failed to set bean properties on servlet '" + getServletName() + "'", ex);
				}
				throw ex;
			}
		}

		// 初始化Servlet，往下看
		initServletBean();

		if (logger.isDebugEnabled()) {
			logger.debug("Servlet '" + getServletName() + "' configured successfully");
		}
	}

protected final void initServletBean() throws ServletException {
		getServletContext().log("Initializing Spring FrameworkServlet '" + getServletName() + "'");
		if (this.logger.isInfoEnabled()) {
			this.logger.info("FrameworkServlet '" + getServletName() + "': initialization started");
		}
		long startTime = System.currentTimeMillis();

		try {
		  	//初始化web容器
			this.webApplicationContext = initWebApplicationContext();
		  	//扩展点
			initFrameworkServlet();
		}
		catch (ServletException ex) {
			this.logger.error("Context initialization failed", ex);
			throw ex;
		}
		catch (RuntimeException ex) {
			this.logger.error("Context initialization failed", ex);
			throw ex;
		}

		if (this.logger.isInfoEnabled()) {
			long elapsedTime = System.currentTimeMillis() - startTime;
			this.logger.info("FrameworkServlet '" + getServletName() + "': initialization completed in " +
					elapsedTime + " ms");
		}
	}
```
##### 2、WebApplicationContext
> spring中的一个接口，它是applicationContext的一个扩展，专用于Web应用程序环境。主要用于管理Spring应用程序中的所有bean实例以及其依赖关系，同时提供了访问Servlet API和web应用程序上下文的特定功能。
> 主要流程：
> - 从ServletContext中获取webApplicationContext
> - 如果存在则判断当前是否为可配置的上下文
>    - 如果为可配置的上下文则进行激活判断
>    - 是否需要配置父容器
>    - 配置并刷新上下文
> - 如果上下文不存在尝试查找上下文，未查找到则进行上下文创建
> - 没有收到刷新事件则进行上下文刷新。
> - 如果设置了发布上下文则将上下文作为servletContext的属性进行发布。
> 

```java
protected WebApplicationContext initWebApplicationContext() {
  		//获取AnnotationConfigServletWebServerApplicationContext类型的web容器
		WebApplicationContext rootContext =
				WebApplicationContextUtils.getWebApplicationContext(getServletContext());
		WebApplicationContext wac = null;
        //如果上下文对象存在
		if (this.webApplicationContext != null) {
			wac = this.webApplicationContext;
            //如果当前上下文是可配置的webApplicationContext
			if (wac instanceof ConfigurableWebApplicationContext) {
				ConfigurableWebApplicationContext cwac = (ConfigurableWebApplicationContext) wac;
				//如果上下文对象还没有被激活
                if (!cwac.isActive()) {
                    //如果当前上下文对象还没有父容器
					if (cwac.getParent() == null) {
						cwac.setParent(rootContext);
					}
                    //配置并刷新当前上下文
					configureAndRefreshWebApplicationContext(cwac);
				}
			}
		}
    //如果上下文对象不存在，尝试查找上下文对象
		if (wac == null) {
			wac = findWebApplicationContext();
		}
    //如果任然查找不到上下文对象，则创建新的上下文对象
		if (wac == null) {
			wac = createWebApplicationContext(rootContext);
		}
    //如果没收到刷新事件，则执行刷新操作
		if (!this.refreshEventReceived) {
			// 刷新应用上下文，这里是重点，接着往下看
			onRefresh(wac);
		}
    //如果设置了发布上下文，则将当前webApplicationContext作为ServletContext属性发布
		if (this.publishContext) {
			// 推送事件通知
			String attrName = getServletContextAttributeName();
			getServletContext().setAttribute(attrName, wac);
			if (this.logger.isDebugEnabled()) {
				this.logger.debug("Published WebApplicationContext of servlet '" + getServletName() +
						"' as ServletContext attribute with name [" + attrName + "]");
			}
		}

		return wac;
	}
```
###### 1、configureAndRefreshWebApplicationContext
> 刷新并配置上下文；
> 刷新及初始化相关的核心组件，例如文件上传，处理器适配器，视图解析等。
> 配置上下文，如果wac使用了默认的id则需要重新配置id，设置wac的ServletContext属性。

```java
protected void configureAndRefreshWebApplicationContext(ConfigurableWebApplicationContext wac) {
    if (ObjectUtils.identityToString(wac).equals(wac.getId())) {
        // 如果应用程序上下文的 id 仍然是其原始默认值
        // -> 根据可用的信息分配一个更有用的 id
        if (this.contextId != null) {
            wac.setId(this.contextId);
        }
        else {
            // 生成默认的 id...
            wac.setId(ConfigurableWebApplicationContext.APPLICATION_CONTEXT_ID_PREFIX +
                    ObjectUtils.getDisplayString(getServletContext().getContextPath()) + '/' + getServletName());
        }
    }

    // 设置 Servlet 上下文和 Servlet 配置
    wac.setServletContext(getServletContext());
    wac.setServletConfig(getServletConfig());

    // 设置命名空间
    wac.setNamespace(getNamespace());

    // 添加应用程序监听器，用于上下文刷新事件
    wac.addApplicationListener(new SourceFilteringListener(wac, new ContextRefreshListener()));

    // 在刷新上下文之前，确保 wac 环境的属性源已经初始化
    ConfigurableEnvironment env = wac.getEnvironment();
    if (env instanceof ConfigurableWebEnvironment) {
        // 如果环境是可配置的 Web 环境，立即初始化属性源
        ((ConfigurableWebEnvironment) env).initPropertySources(getServletContext(), getServletConfig());
    }

    // 对 Web 应用程序上下文进行后处理
    postProcessWebApplicationContext(wac);

    // 应用初始化器到上下文中
    applyInitializers(wac);

    // 刷新 Web 应用程序上下文
    wac.refresh();
}

```
##### 3、onRefresh
> 

## 2、DipatcherServlet
> 我们经常用到的请求方式大概就是get和post了，通过DispatcherServlet中的请求处理doGet和doPost去跟踪请求的处理链。
> 这两个方法是HttpServlet里面的方法，内置逻辑都是调用了ProcessRequest进行处理。
> processRequest方法是Servlet环境下处理请求的核心方法，它负责处理请求的整个生命周期，包括上下文管理、异常处理、异步请求等重要功能。

```java
protected final void processRequest(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
        //记录请求处理开始时间
		long startTime = System.currentTimeMillis();
		Throwable failureCause = null;

        //保存当前LocaleContext，设置新的LocaleContext
		LocaleContext previousLocaleContext = LocaleContextHolder.getLocaleContext();
		LocaleContext localeContext = buildLocaleContext(request);

        //保存当前的RequestAttributes，设置新的RequestAttributes
		RequestAttributes previousAttributes = RequestContextHolder.getRequestAttributes();
		ServletRequestAttributes requestAttributes = buildRequestAttributes(request, response, previousAttributes);

        // 获取异步请求管理器，注册一个Callable拦截器
		WebAsyncManager asyncManager = WebAsyncUtils.getAsyncManager(request);
		asyncManager.registerCallableInterceptor(FrameworkServlet.class.getName(), new RequestBindingInterceptor());

        //初始化线程持有者为当前请求request
		initContextHolders(request, localeContext, requestAttributes);

		try {
            //执行实际的请求处理逻辑
			doService(request, response);
		}
		catch (ServletException | IOException ex) {
			failureCause = ex;
			throw ex;
		}
		catch (Throwable ex) {
			failureCause = ex;
			throw new NestedServletException("Request processing failed", ex);
		}

		finally {
            //重置上下文持有者为之前的状态
			resetContextHolders(request, previousLocaleContext, previousAttributes);
			//标记请求完成
            if (requestAttributes != null) {
				requestAttributes.requestCompleted();
			}

			if (logger.isDebugEnabled()) {
				if (failureCause != null) {
					this.logger.debug("Could not complete request", failureCause);
				}
				else {
					if (asyncManager.isConcurrentHandlingStarted()) {
						logger.debug("Leaving response open for concurrent processing");
					}
					else {
						this.logger.debug("Successfully completed request");
					}
				}
			}
            //发布请求完成事件
			publishRequestHandledEvent(request, response, startTime, failureCause);
		}
	}
```
### 1、doService
> 该方法的主要作用是实际处理客户端请求。这个方法在SpringMVC中扮演的核心角色，负责调度和委派请求到合适的处理器(Controller)。
> 主要任务是：
> - 请求预处理
>    - 在实际处理请求之前进行一些预处理操作，例如安全检查、参数解析、请求绑定。
> - 请求分发和处理
>    - HandlerMapping的选择
>    - HandlerAdapter的选择
> - 执行请求
>    - 调用选择的Adapter来执行请求处理器controller，并获取处理结果。
> - 视图渲染和解析
>    - ViewResolver的选择，根据处理器返回的逻辑视图命名选择合适的ViewResolver来解析视图。
>    - 视图渲染，将模型数据填充到视图中，生成最终响应的内容。
> - 异常处理
>    - 通过HandlerExceptionResolver来处理异常。
> - 返回响应

```java
@Override
protected void doService(HttpServletRequest request, HttpServletResponse response) throws Exception {
    //如果日志级别是Debug，则记录请求的相关信息
    if (logger.isDebugEnabled()) {
        String resumed = WebAsyncUtils.getAsyncManager(request).hasConcurrentResult() ? " resumed" : "";
        logger.debug("DispatcherServlet with name '" + getServletName() + "'" + resumed +
                " processing " + request.getMethod() + " request for [" + getRequestUri(request) + "]");
    }

    // Keep a snapshot of the request attributes in case of an include,
    // to be able to restore the original attributes after the include.
    //如果是以include形式发起的请求，需要保留原始请求属性，以便后续恢复
    Map<String, Object> attributesSnapshot = null;
    if (WebUtils.isIncludeRequest(request)) {
        attributesSnapshot = new HashMap<>();
        Enumeration<?> attrNames = request.getAttributeNames();
        while (attrNames.hasMoreElements()) {
            String attrName = (String) attrNames.nextElement();
            if (this.cleanupAfterInclude || attrName.startsWith(DEFAULT_STRATEGIES_PREFIX)) {
                attributesSnapshot.put(attrName, request.getAttribute(attrName));
            }
        }
    }

    // Make framework objects available to handlers and view objects.
    //	将框架的一些属性和请求进行绑定，使得controller和视图能够访问到这些对象。
    request.setAttribute(WEB_APPLICATION_CONTEXT_ATTRIBUTE, getWebApplicationContext());
    request.setAttribute(LOCALE_RESOLVER_ATTRIBUTE, this.localeResolver);
    request.setAttribute(THEME_RESOLVER_ATTRIBUTE, this.themeResolver);
    request.setAttribute(THEME_SOURCE_ATTRIBUTE, getThemeSource());

    // 如果存在flashMapMannager，则处理FlashMap
    if (this.flashMapManager != null) {
        //尝试从请求中检索出来FlashMap
        FlashMap inputFlashMap = this.flashMapManager.retrieveAndUpdate(request, response);
        if (inputFlashMap != null) {
            request.setAttribute(INPUT_FLASH_MAP_ATTRIBUTE, Collections.unmodifiableMap(inputFlashMap));
        }
        request.setAttribute(OUTPUT_FLASH_MAP_ATTRIBUTE, new FlashMap());
        request.setAttribute(FLASH_MAP_MANAGER_ATTRIBUTE, this.flashMapManager);
    }

    try {
        //进入实际的请求分发和处理阶段
        doDispatch(request, response);
    }
    finally {
        //如果请求没有异步处理启动，则在处理完成之后恢复原始的请求属性快照
        if (!WebAsyncUtils.getAsyncManager(request).isConcurrentHandlingStarted()) {
            // Restore the original attribute snapshot, in case of an include.
            if (attributesSnapshot != null) {
                restoreAttributesAfterInclude(request, attributesSnapshot);
            }
        }
    }
}
```
> - **flashMap**
>    - 是spring mvc中在用于重定向时传递数据的一种机制。在Web开发中，重定向后的原始请求的数据往往会丢失，为了能够在重定向后仍能够传递数据，Spring MVC提供了FlashMap支持》
>    - 当以请求需要重定向到另一个URL时，可以将需要传递的数据放入到FlashMap中。这些数据会在重定向后的请求中可用。
>    - 在controller中通过RedirectAttribute或FlashMannager将需要传递的数据放入FlashMap中，在重定向目标页面或方法中，通过特定的属性名获取FlashMap中的数据，并进行显示处理。
> - **include请求**
>    - include请求是通过RequestDispatcher接口将一个Servlet的输出包含到另一个Servlet或JSP页面的技术。
>    - 是一种动态聚合页面的技术。

### 2、doDispatch
> spring mvc 中请求处理的核心逻辑，负责整个请求的分发、异常处理和结果处理，通过合理的异常处理和资源清理确保了请求处理的可靠性和健壮性。

```java
protected void doDispatch(HttpServletRequest request, HttpServletResponse response) throws Exception {
    HttpServletRequest processedRequest = request;
    HandlerExecutionChain mappedHandler = null;
    boolean multipartRequestParsed = false;

    //获取异步管理器
    WebAsyncManager asyncManager = WebAsyncUtils.getAsyncManager(request);

    try {
        ModelAndView mv = null;
        Exception dispatchException = null;

        try {
            //检查是否为multupart请求，如果是则进行特殊处理
            processedRequest = checkMultipart(request);
            multipartRequestParsed = (processedRequest != request);

            // Determine handler for the current request.
            //获取对应的handler链
            mappedHandler = getHandler(processedRequest);
            if (mappedHandler == null) {
                //如果没有获取到handler则返回404异常
                noHandlerFound(processedRequest, response);
                return;
            }

            // Determine handler adapter for the current request.
            //根据handler获取对应的handlerAdapter
            HandlerAdapter ha = getHandlerAdapter(mappedHandler.getHandler());

            // Process last-modified header, if supported by the handler.
            // 处理last-modified情况，用于缓存控制
            String method = request.getMethod();
            boolean isGet = "GET".equals(method);
            if (isGet || "HEAD".equals(method)) {
                long lastModified = ha.getLastModified(request, mappedHandler.getHandler());
                if (logger.isDebugEnabled()) {
                    logger.debug("Last-Modified value for [" + getRequestUri(request) + "] is: " + lastModified);
                }
                // 检查是否需要返回304 not modified
                if (new ServletWebRequest(request, response).checkNotModified(lastModified) && isGet) {
                    return;
                }
            }

            //执行前置拦截器
            if (!mappedHandler.applyPreHandle(processedRequest, response)) {
                return;
            }

            // Actually invoke the handler.
            //调用handler处理请求，并返回ModelAndView
            mv = ha.handle(processedRequest, response, mappedHandler.getHandler());

            //如果异步处理已经开始，则直接返回，等待后续处理
            if (asyncManager.isConcurrentHandlingStarted()) {
                return;
            }

            //如果处理器没有返回视图，则使用默认视图
            applyDefaultViewName(processedRequest, mv);
            //执行后置拦截器
            mappedHandler.applyPostHandle(processedRequest, response, mv);
        }
        catch (Exception ex) {
            dispatchException = ex;
        }
        catch (Throwable err) {
            // As of 4.3, we're processing Errors thrown from handler methods as well,
            // making them available for @ExceptionHandler methods and other scenarios.
            dispatchException = new NestedServletException("Handler dispatch failed", err);
        }
        processDispatchResult(processedRequest, response, mappedHandler, mv, dispatchException);
    }
    catch (Exception ex) {
        triggerAfterCompletion(processedRequest, response, mappedHandler, ex);
    }
    catch (Throwable err) {
        triggerAfterCompletion(processedRequest, response, mappedHandler,
                new NestedServletException("Handler processing failed", err));
    }
    finally {
        //如果是并发处理请求则应用并发处理后置请求
        if (asyncManager.isConcurrentHandlingStarted()) {
            // Instead of postHandle and afterCompletion
            if (mappedHandler != null) {
                mappedHandler.applyAfterConcurrentHandlingStarted(processedRequest, response);
            }
        }
        else {
            //如果不是并发请求则清理multipart请求相关资源
            // Clean up any resources used by a multipart request.
            if (multipartRequestParsed) {
                cleanupMultipart(processedRequest);
            }
        }
    }
}
```
> - last-modified
>    - 在http响应头中使用last-modified字段来帮助客户端和服务器端来进行缓存控制。
>    - 通过告知客户端资源的最后修改时间，客户端可以在下次请求的时候通过if-Modified-Since头部向服务器端询问资源是否有更新，如果没更新服务器端返回304 not modified，客户端可直接使用本地缓存。

#### 1、getHandler
> dispatcherServlet的核心，主要作用是获取Request的处理器链。
> handlerExecutionChain 即HandlerMethod和HandlerInterceptor们。

```java
@Nullable
protected HandlerExecutionChain getHandler(HttpServletRequest request) throws Exception {
    if (this.handlerMappings != null) {
        //从handlerMapping中获取对应的handlerExecutionChain
        for (HandlerMapping hm : this.handlerMappings) {
            if (logger.isTraceEnabled()) {
                logger.trace(
                        "Testing handler map [" + hm + "] in DispatcherServlet with name '" + getServletName() + "'");
            }
            HandlerExecutionChain handler = hm.getHandler(request);
            if (handler != null) {
                return handler;
            }
        }
    }
    return null;
}
@Override
@Nullable
public final HandlerExecutionChain getHandler(HttpServletRequest request) throws Exception {
    //获取当前请求的handler对象
    Object handler = getHandlerInternal(request);
    if (handler == null) {
        //没有获取到，尝试获取默认的handler
        handler = getDefaultHandler();
    }
    if (handler == null) {
        return null;
    }
    // Bean name or resolved handler?
    //如果获取到的handler是String类型的，说明他是bean的名字要从容器里面获取到实例
    if (handler instanceof String) {
        String handlerName = (String) handler;
        handler = obtainApplicationContext().getBean(handlerName);
    }

    //通过handler对象和request请求获取到相关的handler和拦截器链
    HandlerExecutionChain executionChain = getHandlerExecutionChain(handler, request);
    //如果是跨域请求，进行处理
    if (CorsUtils.isCorsRequest(request)) {
        //根据全局跨域的配置进行处理
        CorsConfiguration globalConfig = this.globalCorsConfigSource.getCorsConfiguration(request);
        CorsConfiguration handlerConfig = getCorsConfiguration(handler, request);
        CorsConfiguration config = (globalConfig != null ? globalConfig.combine(handlerConfig) : handlerConfig);
        executionChain = getCorsHandlerExecutionChain(request, executionChain, config);
    }
    return executionChain;
}
```
##### 1、getHandlerInternal
> 根据传入的request获取到具体的handler对象，即根据url获取到合适的处理器方法HandlerMethod。
> 它实现了路径到处理器的映射逻辑，包括直接路径匹配和全局映射遍历，确保能够正确的路由到相应的处理器方法。

```java
@Override
@Nullable
protected Object getHandlerInternal(HttpServletRequest request) throws Exception {
    //获取url
    String lookupPath = getUrlPathHelper().getLookupPathForRequest(request);
    //根据url获取handler
    Object handler = lookupHandler(lookupPath, request);
    //找不到处理器
    if (handler == null) {
        // We need to care for the default handler directly, since we need to
        // expose the PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE for it as well.
        Object rawHandler = null;
        //如果请求是根路径，直接返回rootHandler
        if ("/".equals(lookupPath)) {
            rawHandler = getRootHandler();
        }
        //返回默认处理器
        if (rawHandler == null) {
            rawHandler = getDefaultHandler();
        }
        if (rawHandler != null) {
            // Bean name or resolved handler?
            //如果处理器是字符串类型的，通过上下文获取bean
            if (rawHandler instanceof String) {
                String handlerName = (String) rawHandler;
                rawHandler = obtainApplicationContext().getBean(handlerName);
            }
            //检验处理器的有效性
            validateHandler(rawHandler, request);
            //构造一个能够暴露请求路径的处理器
            handler = buildPathExposingHandler(rawHandler, lookupPath, lookupPath, null);
        }
    }
    if (handler != null && logger.isDebugEnabled()) {
        logger.debug("Mapping [" + lookupPath + "] to " + handler);
    }
    else if (handler == null && logger.isTraceEnabled()) {
        logger.trace("No handler mapping found for [" + lookupPath + "]");
    }
    return handler;
}
@Nullable
protected Object lookupHandler(String urlPath, HttpServletRequest request) throws Exception {
    // Direct match?
    Object handler = this.handlerMap.get(urlPath);
    if (handler != null) {
        // Bean name or resolved handler?
        if (handler instanceof String) {
            String handlerName = (String) handler;
            handler = obtainApplicationContext().getBean(handlerName);
        }
        validateHandler(handler, request);
        return buildPathExposingHandler(handler, urlPath, urlPath, null);
    }

    // Pattern match?
    //如果直接匹配未找到，尝试使用模式匹配
    List<String> matchingPatterns = new ArrayList<>();
    for (String registeredPattern : this.handlerMap.keySet()) {
        //使用路径匹配器进行模式匹配
        if (getPathMatcher().match(registeredPattern, urlPath)) {
            matchingPatterns.add(registeredPattern);
        }
        else if (useTrailingSlashMatch()) {
            //对多一个斜杠进行匹配
            if (!registeredPattern.endsWith("/") && getPathMatcher().match(registeredPattern + "/", urlPath)) {
                matchingPatterns.add(registeredPattern +"/");
            }
        }
    }

    String bestMatch = null;
    Comparator<String> patternComparator = getPathMatcher().getPatternComparator(urlPath);
    //如果是按模式匹配的，则根据比较器选择一个最佳匹配
    if (!matchingPatterns.isEmpty()) {
        matchingPatterns.sort(patternComparator);
        if (logger.isDebugEnabled()) {
            logger.debug("Matching patterns for request [" + urlPath + "] are " + matchingPatterns);
        }
        bestMatch = matchingPatterns.get(0);
    }
    //如果存在最佳匹配
    if (bestMatch != null) {
        //获取处理器
        handler = this.handlerMap.get(bestMatch);
        if (handler == null) {
            if (bestMatch.endsWith("/")) {
                handler = this.handlerMap.get(bestMatch.substring(0, bestMatch.length() - 1));
            }
            if (handler == null) {
                throw new IllegalStateException(
                        "Could not find handler for best pattern match [" + bestMatch + "]");
            }
        }
        // Bean name or resolved handler?
        if (handler instanceof String) {
            String handlerName = (String) handler;
            handler = obtainApplicationContext().getBean(handlerName);
        }
        validateHandler(handler, request);
        String pathWithinMapping = getPathMatcher().extractPathWithinPattern(bestMatch, urlPath);

        // There might be multiple 'best patterns', let's make sure we have the correct URI template variables
        // for all of them
        Map<String, String> uriTemplateVariables = new LinkedHashMap<>();
        for (String matchingPattern : matchingPatterns) {
            if (patternComparator.compare(bestMatch, matchingPattern) == 0) {
                Map<String, String> vars = getPathMatcher().extractUriTemplateVariables(matchingPattern, urlPath);
                Map<String, String> decodedVars = getUrlPathHelper().decodePathVariables(request, vars);
                uriTemplateVariables.putAll(decodedVars);
            }
        }
        if (logger.isDebugEnabled()) {
            logger.debug("URI Template variables for request [" + urlPath + "] are " + uriTemplateVariables);
        }
        //构建一个能够暴露请求路径的处理器
        return buildPathExposingHandler(handler, bestMatch, pathWithinMapping, uriTemplateVariables);
    }

    // No handler found...
    return null;
}
```
##### 2、buildPathExposingHandler
> 封装请求路径信息并将其传递给处理器。

```java
protected Object buildPathExposingHandler(Object rawHandler, String bestMatchingPattern,
        String pathWithinMapping, @Nullable Map<String, String> uriTemplateVariables) {

    //创建一个hadnlerExecution链，用于包装原始处理器对象
    HandlerExecutionChain chain = new HandlerExecutionChain(rawHandler);
    //添加一个PathExposingHandlerInterceptor拦截器
    chain.addInterceptor(new PathExposingHandlerInterceptor(bestMatchingPattern, pathWithinMapping));
    //如果URI模板变量不变，添加一个UriTemplateVariablesHandlerInterceptor 拦截器
    if (!CollectionUtils.isEmpty(uriTemplateVariables)) {
        chain.addInterceptor(new UriTemplateVariablesHandlerInterceptor(uriTemplateVariables));
    }
    return chain;
}
```
> - **PathExposingHandlerInterceptor**
>    - 主要负责将请求的最佳匹配模式bestMatchingPattern和路径中的模式pathWithinMapping传递给处理器。
> - **UriTemplateVariablesHandlerIntercptor**
>    - 作用是将URI模板变量uriTemplateVaribles传递给处理器，以供处理器使用这些变量进行业务逻辑的处理或决策。

#### 2、getHandlerAdapter
> 获取处理器适配器

```java
protected HandlerAdapter getHandlerAdapter(Object handler) throws ServletException {
    if (this.handlerAdapters != null) {
        for (HandlerAdapter ha : this.handlerAdapters) {
            if (logger.isTraceEnabled()) {
                logger.trace("Testing handler adapter [" + ha + "]");
            }
            //不同的handlerAdapter的判断方法不同
            if (ha.supports(handler)) {
                return ha;
            }
        }
    }
    throw new ServletException("No adapter for handler [" + handler +
            "]: The DispatcherServlet configuration needs to include a HandlerAdapter that supports this handler");
}
以SimpleControllerHandlerAdapter为例，判断是否实现Controller接口
public boolean supports(Object handler) {
   return (handler instanceof Controller);
}
```
#### 3、handle
> 进行请求处理

```java
public ModelAndView handle(HttpServletRequest request, HttpServletResponse response, Object handler)
        throws Exception {

    return ((Controller) handler).handleRequest(request, response);
}

@Override
@Nullable
public ModelAndView handleRequest(HttpServletRequest request, HttpServletResponse response)
        throws Exception {
    //如果是Option请求
    if (HttpMethod.OPTIONS.matches(request.getMethod())) {
        response.setHeader("Allow", getAllowHeader());
        return null;
    }

    // Delegate to WebContentGenerator for checking and preparing.
    //检查请求和响应
    checkRequest(request);
    prepareResponse(response);

    // Execute handleRequestInternal in synchronized block if required.
    //如果需要同步会话
    if (this.synchronizeOnSession) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            //获取会话的互斥锁
            Object mutex = WebUtils.getSessionMutex(session);
            synchronized (mutex) {
                //在同步块中执行
                return handleRequestInternal(request, response);
            }
        }
    }
    //不需要同步执行时
    return handleRequestInternal(request, response);
}
```
#### 4、processDispatchResult
> 处理返回的结果

```java
private void processDispatchResult(HttpServletRequest request, HttpServletResponse response,
        @Nullable HandlerExecutionChain mappedHandler, @Nullable ModelAndView mv,
        @Nullable Exception exception) throws Exception {

    boolean errorView = false;

    // 如果有异常抛出
    if (exception != null) {
        if (exception instanceof ModelAndViewDefiningException) {
            // 如果异常是 ModelAndViewDefiningException 类型，则从异常中获取 ModelAndView 对象
            logger.debug("ModelAndViewDefiningException encountered", exception);
            mv = ((ModelAndViewDefiningException) exception).getModelAndView();
        }
        else {
            // 否则，处理异常，获取处理后的 ModelAndView 对象
            Object handler = (mappedHandler != null ? mappedHandler.getHandler() : null);
            mv = processHandlerException(request, response, handler, exception);
            errorView = (mv != null); // 标记是否有错误视图
        }
    }

    // 检查 ModelAndView 是否存在且未被清除
    if (mv != null && !mv.wasCleared()) {
        // 渲染视图 
        render(mv, request, response);
        if (errorView) {
            // 如果是错误视图，清除请求中的错误属性
            WebUtils.clearErrorRequestAttributes(request);
        }
    }
    else {
        // 如果 ModelAndView 为 null
        if (logger.isDebugEnabled()) {
            logger.debug("Null ModelAndView returned to DispatcherServlet with name '" + getServletName() +
                    "': assuming HandlerAdapter completed request handling");
        }
    }

    // 检查是否启动了异步处理
    if (WebAsyncUtils.getAsyncManager(request).isConcurrentHandlingStarted()) {
        // 如果在转发期间启动了并发处理，则直接返回
        return;
    }

    // 执行请求处理完成后的收尾工作
    if (mappedHandler != null) {
        mappedHandler.triggerAfterCompletion(request, response, null);
    }
}

```
##### 1、render
> 渲染modeAndView。根据modeAndView对象中的信息确定要渲染的视图，并调用对应的视图对象的render方法完成视图渲染的过程。

```java
protected void render(ModelAndView mv, HttpServletRequest request, HttpServletResponse response) throws Exception {
		// Determine locale for request and apply it to the response.
        //解析Request中获得Locale对象，并将其设置到response中
		Locale locale =
				(this.localeResolver != null ? this.localeResolver.resolveLocale(request) : request.getLocale());
		response.setLocale(locale);

		View view;
		String viewName = mv.getViewName();
        //情况1：通过viewName获得view对象
		if (viewName != null) {
			// We need to resolve the view name.
			view = resolveViewName(viewName, mv.getModelInternal(), locale, request);
			if (view == null) {
				throw new ServletException("Could not resolve view with name '" + mv.getViewName() +
						"' in servlet with name '" + getServletName() + "'");
			}
		}
		else {
            //情况2：直接使用modeAndView对象
			// No need to lookup: the ModelAndView object contains the actual View object.
			view = mv.getView();
			if (view == null) {
				throw new ServletException("ModelAndView [" + mv + "] neither contains a view name nor a " +
						"View object in servlet with name '" + getServletName() + "'");
			}
		}

		// Delegate to the View object for rendering.
		if (logger.isDebugEnabled()) {
			logger.debug("Rendering view [" + view + "] in DispatcherServlet with name '" + getServletName() + "'");
		}
		try {
			if (mv.getStatus() != null) {
				response.setStatus(mv.getStatus().value());
			}
            //渲染页面
			view.render(mv.getModelInternal(), request, response);
		}
		catch (Exception ex) {
			if (logger.isDebugEnabled()) {
				logger.debug("Error rendering view [" + view + "] in DispatcherServlet with name '" +
						getServletName() + "'", ex);
			}
			throw ex;
		}
	}
```
# 三、总结
> Spring mvc主要由两个流程构成的整个工作机制，即Spring mvc的初始化流程和dispatcherServlet处理请求的流程。

## 一、初始化流程
dispatcherServlet的实现树如下：
```java
GenericServlet (javax.servlet)
    HttpServlet (javax.servlet.http)
        HttpServletBean (org.springframework.web.servlet)
            FrameworkServlet (org.springframework.web.servlet)
                DispatcherServlet (org.springframework.web.servlet)
```

- 将spring的根上下文初始化，并存入ServletContext中。
   - Tomcat启动的时候会依次加载web.xml中的配置的Listener、Filter、Servlet、ContextLoaderListener。
   - 在springboot中这些配置则在WebMvcAutoConfiguration配置类进行自动配置。
   - ContextLoaderListener类继承了ContextLoader用来初始化Spring的上下文并将其放入到ServletContext中。
   - Tomcat容器首先会调用ContextLoader中initWebApplicationContext方法。
- 通过disptacherServlet初始化子上下文。
   - 根据实现树发现，实现了httpSerletBean接口，HttpServletBean又重写了HttpServlet的init方法。
      - 该方法的作用是读取相关配置，创建Servlet
   - HttpServletBean之后就是FrameworkServlet接口中的initServletBean
      - 该方法主要作用是初始化spring的子上下文，设置其父上下文，使之与ServletContext关联；
   - 最后调用DispatcherServlet的initWebApplicationContext方法
      - 作用1：通过三种方式检索WebApplicationContext
         - 构造方法检索
         - 从ServletContext中检索
         - 自行创建
      - 作用2：如果未接收到ContextRefreshedEvent，则进行组件实现类的初始化
- 总结
   - 如果在web.xml或者配置类中配置了org.springframework.web.context.ContextLoaderListener的话，tomcat启动时会先加载父容器，并将其放入到ServletContext中。
   - 然后会加载DisptacherServlet，因为Disptacher实质是一个Servlet，所以它会先执行init方法。
      - 这个方法在httpServletBean类中实现，主要是读取配置创建Servlet。
   - 既而触发FreamworkServlet中的initServletBean方法。
      - 该方法主要是初始化Spring的子上下文，设置其父上下文，并放入到ServletContext中
   - 最后通过FrameworkServlet触发DisptacherServlet中的onRefresh方法进行组件是实现类的初始化。自此spring mvc的初始化结束。

## 二、请求处理流程

- 已知dispatcherServlet是一个特殊的Servlet，它会使用Servlet的特性调用doGet或doPost方法来处理请求，这两个方法最终都是调用processRequest方法实现。以下是解析processRequest方法的主要作用
- 1、根据请求的URL通过RequestMapping找到对应的handlerExcutionChain（处理器链）即handlerMethod和一些HandlerInterceptor。
   - 即通过url从handlerMapping中找到请求的方法处理器，其中包含方法本身信息以及所属控制器对象、方法参数等。
   - HandlerInterceptor则是一些用户自行定义的拦截器，自行定义一些操作，主要是记录日志、检查权限修改请求或者响应等。
- 2、根据根据获取到的handlerMethod从HandlerAdapter中获取到对应的handlerAdapter。
   - 根据handlerMethod的类型从handlerAdapter中获取到对应的处理器适配器。
- 3、通过handlerAdapter调用对应的handler方法返回ModeAndView
- 4、通过ViewResolver视图解析器去解析视图
   - 解析viewName去获取对应的视图
- 5、DispatcherServlet将得到的视图进行渲染，填充到request域中
- 6、响应结果给用户。
- 总结
   - disptacher根据请求路径通过HandlerMapping解析出对应的handler
   - 根据handler从handlerAdapter找到对应的处理器适配器
   - 根据适配器调用handler，生成对应的ModeAndView
   - 通过视图解析器ViewResolver解析视图，根据视图名找到对应的视图。
   - 根据视图进行渲染，填充到request中，响应结果。
