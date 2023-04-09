CREATE DATABASE IF NOT EXISTS `db_sminex` CHARACTER SET utf8 COLLATE utf8_general_ci;
CREATE USER 'usr_sminex'@'%' IDENTIFIED BY '?r^WslLdEs!Cej';
GRANT ALL ON `db_sminex`.* TO 'usr_sminex'@'%';
FLUSH PRIVILEGES;
