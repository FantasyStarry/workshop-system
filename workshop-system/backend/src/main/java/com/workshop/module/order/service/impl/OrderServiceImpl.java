package com.workshop.module.order.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.workshop.common.exception.BusinessException;
import com.workshop.module.order.dto.OrderCreateDTO;
import com.workshop.module.order.dto.OrderItemCreateDTO;
import com.workshop.module.order.dto.OrderPageDTO;
import com.workshop.module.order.entity.Order;
import com.workshop.module.order.entity.OrderFile;
import com.workshop.module.order.entity.OrderItem;
import com.workshop.module.order.mapper.OrderFileMapper;
import com.workshop.module.order.mapper.OrderItemMapper;
import com.workshop.module.order.mapper.OrderMapper;
import com.workshop.module.order.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import io.ebean.uuidv7.UUIDv7;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderMapper orderMapper;

    @Autowired
    private OrderItemMapper orderItemMapper;

    @Autowired
    private OrderFileMapper orderFileMapper;

    private String generateOrderNo() {
        String today = LocalDate.now().toString().replace("-", "");
        String uuid = UUIDv7.generate().toString().replace("-", "").substring(0, 8);
        return "ORD" + today + uuid;
    }

    @Override
    public Page<Order> pageQuery(Page<Order> page, OrderPageDTO dto) {
        long offset = (page.getCurrent() - 1) * page.getSize();

        List<Order> records = orderMapper.pageQuery(offset, page.getSize(),
                dto.getOrderNo(), dto.getCustomerName(), dto.getStatus(),
                dto.getStartDate(), dto.getEndDate());
        long total = orderMapper.countQuery(dto.getOrderNo(), dto.getCustomerName(),
                dto.getStatus(), dto.getStartDate(), dto.getEndDate());

        page.setRecords(records);
        page.setTotal(total);
        return page;
    }

    @Override
    public Map<String, Object> getDetail(Long id) {
        Order order = orderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException(404, "订单不存在");
        }

        List<OrderItem> items = orderItemMapper.selectList(
                new LambdaQueryWrapper<OrderItem>().eq(OrderItem::getOrderId, id)
        );

        List<OrderFile> files = orderFileMapper.selectList(
                new LambdaQueryWrapper<OrderFile>().eq(OrderFile::getOrderId, id)
        );

        Map<String, Object> detail = new HashMap<>();
        detail.put("order", order);
        detail.put("items", items);
        detail.put("files", files);
        return detail;
    }

    @Override
    @Transactional
    public Long create(OrderCreateDTO dto, Long userId) {
        // 校验必填字段
        if (!StringUtils.hasText(dto.getCustomerName())) {
            throw new BusinessException(400, "客户名称不能为空");
        }

        // 手动解析日期（避免 Jackson 反序列化兼容问题）
        DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        LocalDateTime orderDate;
        try {
            orderDate = LocalDateTime.parse(dto.getOrderDate(), dateTimeFormatter);
        } catch (Exception e) {
            throw new BusinessException(400, "下单日期格式错误，期望 yyyy-MM-dd HH:mm:ss");
        }

        LocalDate deliveryDate = null;
        if (StringUtils.hasText(dto.getDeliveryDate())) {
            try {
                deliveryDate = LocalDate.parse(dto.getDeliveryDate(), dateFormatter);
            } catch (Exception e) {
                throw new BusinessException(400, "交付日期格式错误，期望 yyyy-MM-dd");
            }
        }

        Order order = new Order();
        order.setOrderNo(generateOrderNo());
        order.setCustomerName(dto.getCustomerName());
        order.setCustomerContact(dto.getCustomerContact());
        order.setCustomerPhone(dto.getCustomerPhone());
        order.setCustomerAddress(dto.getCustomerAddress());
        order.setOrderDate(orderDate);
        order.setDeliveryDate(deliveryDate != null ? deliveryDate.atStartOfDay() : null);
        order.setTotalAmount(dto.getTotalAmount() != null ? dto.getTotalAmount() : BigDecimal.ZERO);
        order.setRemark(dto.getRemark());
        order.setStatus(0); // PENDING
        order.setCreatedBy(userId);

        orderMapper.insert(order);

        // Save order items
        if (dto.getItems() != null) {
            for (OrderItemCreateDTO itemDto : dto.getItems()) {
                OrderItem item = new OrderItem();
                item.setOrderId(order.getId());
                item.setProductId(itemDto.getProductId());
                item.setQuantity(itemDto.getQuantity());
                item.setUnitPrice(itemDto.getUnitPrice() != null ? itemDto.getUnitPrice() : BigDecimal.ZERO);
                item.setSubtotal(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
                item.setProductionStatus(0); // PENDING
                orderItemMapper.insert(item);
            }
        }

        return order.getId();
    }

    @Override
    public void update(Order order) {
        Order existing = orderMapper.selectById(order.getId());
        if (existing == null) {
            throw new BusinessException(404, "订单不存在");
        }
        order.setOrderNo(existing.getOrderNo()); // Don't change order number
        orderMapper.updateById(order);
    }

    @Override
    public void updateStatus(Long id, Integer status) {
        Order order = orderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException(404, "订单不存在");
        }
        order.setStatus(status);
        orderMapper.updateById(order);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Order order = orderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException(404, "订单不存在");
        }
        // Delete related items and files
        orderItemMapper.delete(new LambdaQueryWrapper<OrderItem>().eq(OrderItem::getOrderId, id));
        orderFileMapper.delete(new LambdaQueryWrapper<OrderFile>().eq(OrderFile::getOrderId, id));
        orderMapper.deleteById(id);
    }
}
