﻿namespace BBSS.Api.Helper;

public abstract record MethodResult<T>
{
    public string Value { get; set; }
    private MethodResult() { }
    public abstract TOut Match<TOut>(Func<string, int, TOut> whenLeft, Func<T, TOut> whenRight);
    public abstract Task<MethodResult<TOut>> Bind<TOut>(Func<T, Task<MethodResult<TOut>>> f);

    public record Success(T Data) : MethodResult<T>
    {
        public override TOut Match<TOut>(Func<string, int, TOut> whenLeft, Func<T, TOut> whenRight) => whenRight(Data);
        public override async Task<MethodResult<TOut>> Bind<TOut>(Func<T, Task<MethodResult<TOut>>> f) => await f(Data);
    }

    public record Failure(string ErrorMessage, int StatusCode) : MethodResult<T>
    {
        public override TOut Match<TOut>(Func<string, int, TOut> whenLeft, Func<T, TOut> whenRight) => whenLeft(ErrorMessage, StatusCode);
        public override Task<MethodResult<TOut>> Bind<TOut>(Func<T, Task<MethodResult<TOut>>> f) =>
            Task.FromResult<MethodResult<TOut>>(new MethodResult<TOut>.Failure(ErrorMessage, StatusCode));
    }
}