set -x
cp ../apps/api/src/environment_$1.ts ../apps/api/src/environment.ts
cp ../apps/auth_be/src/environment_$1.ts ../apps/auth_be/src/environment.ts
cp ../apps/auth_fe/common/environment_$1.ts ../apps/auth_fe/common/environment.ts
cp ../apps/app_be/src/environment_$1.ts ../apps/app_be/src/environment.ts
cp ../apps/app_fe/common/environment_$1.ts ../apps/app_fe/common/environment.ts
