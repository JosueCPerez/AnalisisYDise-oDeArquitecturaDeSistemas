# Laboratorio 2: Infraestructura en Alta Disponibilidad con NGINX usando AWS CloudFormation

## Descripción

Este laboratorio despliega una arquitectura de alta disponibilidad en AWS utilizando CloudFormation.

La infraestructura incluye cinco instancias EC2 con NGINX distribuidas en dos zonas de disponibilidad, y un Application Load Balancer que distribuye el tráfico HTTP entre los servidores activos.

## Curso

Análisis y Diseño de Arquitecturas de Sistemas — Sesión 3

## Objetivo

Desplegar una arquitectura de alta disponibilidad en AWS mediante una plantilla YAML de CloudFormation, utilizando servidores EC2 con NGINX y un balanceador de carga para mantener el sitio disponible ante la falla de cualquier instancia.

## Arquitectura desplegada

La plantilla CloudFormation crea los siguientes recursos:

| Recurso | Descripción |
| ------- | ----------- |
| VPC | Red virtual `10.0.0.0/16` con DNS habilitado |
| Internet Gateway | Permite salida a Internet desde la VPC |
| Subnets públicas | Dos subnets en distintas zonas de disponibilidad |
| Route Table | Tabla de rutas con ruta `0.0.0.0/0` hacia el IGW |
| Security Group (ALB) | Permite tráfico HTTP entrante desde Internet |
| Security Group (EC2) | Permite HTTP desde el ALB y SSH desde Internet |
| 5 Instancias EC2 | `t2.micro` con NGINX instalado via UserData |
| Application Load Balancer | Distribuye tráfico entre las cinco instancias |
| Target Group | Registra las cinco instancias en puerto 80 |
| Listener | Escucha en puerto 80 y reenvía al Target Group |

## Distribución de instancias

| Instancia | Subnet | Zona de disponibilidad |
| --------- | ------ | ---------------------- |
| WebServerA-NGINX | PublicSubnetA | AZ 1 |
| WebServerB-NGINX | PublicSubnetB | AZ 2 |
| WebServerC-NGINX | PublicSubnetA | AZ 1 |
| WebServerD-NGINX | PublicSubnetB | AZ 2 |
| WebServerE-NGINX | PublicSubnetA | AZ 1 |

## Parámetros de la plantilla

| Parámetro | Tipo | Descripción |
| --------- | ---- | ----------- |
| `KeyName` | `AWS::EC2::KeyPair::KeyName` | Par de llaves SSH preexistente |
| `LatestAmiId` | `AWS::SSM::Parameter::Value` | AMI de Amazon Linux 2023 (se resuelve automáticamente) |

## Despliegue

1. Accede a la consola de AWS → CloudFormation → **Crear pila**
2. Selecciona **Cargar archivo de plantilla** y sube `laboratorio2.yaml`
3. Nombre de la pila: `InfraAltaDispClase`
4. Ingresa el nombre de tu KeyPair SSH
5. Clic en **Siguiente** → **Siguiente** → **Crear pila**
6. Espera el estado `CREATE_COMPLETE`

La URL del sitio web aparece en la pestaña **Outputs** de la pila como `WebsiteURL`.

## Archivo principal

```text
laboratorio2.yaml
```
