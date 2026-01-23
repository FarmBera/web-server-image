USE webserver;

CREATE TABLE IF NOT EXISTS logs
(
    id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ip_addr    VARCHAR(100) DEFAULT '0.0.0.0',
    content    VARCHAR(255) DEFAULT '-',
    created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
    -- index
    INDEX idx_ip (ip_addr),
    INDEX idx_content (content),
    INDEX idx_created_at (created_at)
) DEFAULT CHARACTER SET = 'utf8mb4'
;