USE webserver;

CREATE TABLE IF NOT EXISTS logs
(
    id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ip_addr    VARCHAR(100) NOT NULL DEFAULT '0.0.0.0',
    code       INT          NOT NULL DEFAULT 0,
    msg        VARCHAR(255),
    content    VARCHAR(1024),
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- index
    INDEX idx_ip (ip_addr),
    INDEX idx_code (code),
    INDEX idx_content (content),
    INDEX idx_created_at (created_at)
) DEFAULT CHARACTER SET = 'utf8mb4'
;