async login(loginDto: any): Promise<{ access_token: string; user: any }> {
  const { email, password } = loginDto;

  const user = await this.prisma.user.findUnique({ where: { email } });
  if (!user) throw new UnauthorizedException('Invalid credentials');

  const isValid = await compare(password, user.password);
  if (!isValid) throw new UnauthorizedException('Invalid credentials');

  // TẠM BỎ REDIS CACHE để test
  // await this.redis.set(cacheKey, {...user, password: undefined}, 3600);

  const payload = {
    sub: user.id,
    username: user.username,
    role: user.role,
  };

  return {
    access_token: this.jwtService.sign(payload),
    user: { id: user.id, username: user.username, email: user.email, role: user.role },
  };
}